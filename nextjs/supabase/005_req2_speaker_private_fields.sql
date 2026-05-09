-- ============================================================
-- REQ-2: 강사 어드민 전용 필드 추가
-- ROLLBACK: supabase/rollback/005_rollback.sql 참조
-- ============================================================

-- ── speaker_private: 어드민 전용 기본 정보 ─────────────────────
CREATE TABLE IF NOT EXISTS speaker_private (
  speaker_id   TEXT        PRIMARY KEY REFERENCES speakers(id) ON DELETE CASCADE,
  speaker_code TEXT        UNIQUE,
  phone        TEXT,
  email        TEXT,
  admin_memo   TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ── speaker_files: 강의안·증명서 파일 ──────────────────────────
CREATE TABLE IF NOT EXISTS speaker_files (
  id          UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
  speaker_id  TEXT   NOT NULL REFERENCES speakers(id) ON DELETE CASCADE,
  file_type   TEXT   NOT NULL CHECK (file_type IN ('lecture_material','career_cert','edu_cert')),
  file_url    TEXT   NOT NULL,
  file_name   TEXT,
  file_size   INT,
  sort_order  INT    DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE speaker_private ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaker_files   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_speaker_private" ON speaker_private FOR ALL USING (is_admin());
CREATE POLICY "admin_all_speaker_files"   ON speaker_files   FOR ALL USING (is_admin());

-- ── Index ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_speaker_files_speaker_id ON speaker_files(speaker_id);

-- ── updated_at trigger ──────────────────────────────────────
CREATE TRIGGER trg_speaker_private_updated_at
  BEFORE UPDATE ON speaker_private
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Storage bucket for speaker documents ────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('speaker-docs', 'speaker-docs', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='admin_read_speaker_docs') THEN
    CREATE POLICY "admin_read_speaker_docs" ON storage.objects
      FOR SELECT USING (bucket_id = 'speaker-docs' AND is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='admin_upload_speaker_docs') THEN
    CREATE POLICY "admin_upload_speaker_docs" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'speaker-docs' AND is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='admin_delete_speaker_docs') THEN
    CREATE POLICY "admin_delete_speaker_docs" ON storage.objects
      FOR DELETE USING (bucket_id = 'speaker-docs' AND is_admin());
  END IF;
END $$;

-- ── Dummy data UPDATE (기존 강사 더미 데이터) ────────────────
-- 실제 운영 전 어드민에서 정확한 정보로 교체 필요
INSERT INTO speaker_private (speaker_id, speaker_code, phone, email, admin_memo)
SELECT
  id,
  TO_CHAR(created_at, 'YYMM') || '_' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at, id)::TEXT, 4, '0') AS speaker_code,
  '010-0000-0000'                         AS phone,
  LOWER(REPLACE(COALESCE(name_en, name), ' ', '.')) || '@example.com' AS email,
  '더미 데이터 — 실제 정보 업데이트 필요' AS admin_memo
FROM speakers
WHERE deleted_at IS NULL
ON CONFLICT (speaker_id) DO NOTHING;
