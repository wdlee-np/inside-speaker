-- ============================================================
-- REQ-6: 일반 사용자 강사 등록 요청 허용 RLS 정책
-- ROLLBACK: DROP POLICY IF EXISTS "public_insert_speakers_registration" ON speakers;
--           DROP POLICY IF EXISTS "public_insert_speaker_subcategories_reg" ON speaker_subcategories;
--           DROP POLICY IF EXISTS "public_insert_speaker_careers_reg" ON speaker_careers;
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='speakers' AND schemaname='public' AND policyname='public_insert_speakers_registration') THEN
    CREATE POLICY "public_insert_speakers_registration" ON speakers
      FOR INSERT WITH CHECK (speaker_status = '등록요청');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='speaker_subcategories' AND schemaname='public' AND policyname='public_insert_speaker_subcategories_reg') THEN
    CREATE POLICY "public_insert_speaker_subcategories_reg" ON speaker_subcategories
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM speakers
          WHERE id = speaker_id AND speaker_status = '등록요청'
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='speaker_careers' AND schemaname='public' AND policyname='public_insert_speaker_careers_reg') THEN
    CREATE POLICY "public_insert_speaker_careers_reg" ON speaker_careers
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM speakers
          WHERE id = speaker_id AND speaker_status = '등록요청'
        )
      );
  END IF;
END $$;
