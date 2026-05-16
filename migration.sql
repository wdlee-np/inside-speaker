-- ============================================================
-- Inside Speakers — DB 스키마 업데이트 마이그레이션
-- Supabase SQL Editor에서 순서대로 실행하세요.
-- ============================================================

-- 1. speaker_private 테이블에 desired_fee 컬럼 추가
ALTER TABLE speaker_private
  ADD COLUMN IF NOT EXISTS desired_fee TEXT DEFAULT NULL;

-- 2. speaker_files.file_type 제약에 'media' 추가
--    (file_type이 CHECK 제약인 경우 아래 실행)
DO $$
DECLARE
  v_constraint_name TEXT;
BEGIN
  SELECT conname INTO v_constraint_name
  FROM pg_constraint
  WHERE conrelid = 'speaker_files'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%file_type%';

  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE speaker_files DROP CONSTRAINT %I', v_constraint_name);
  END IF;

  ALTER TABLE speaker_files
    ADD CONSTRAINT speaker_files_file_type_check
    CHECK (file_type IN ('lecture_material', 'career_cert', 'edu_cert', 'media'));
END $$;

-- ※ 만약 file_type이 ENUM 타입인 경우 위 DO 블록 대신 아래를 실행:
-- ALTER TYPE speaker_file_type ADD VALUE IF NOT EXISTS 'media';

-- 3. inquiries 테이블에 region, desired_time 컬럼 추가
ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS region TEXT DEFAULT NULL;

ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS desired_time TEXT DEFAULT NULL;

-- 4. speaker_topics 테이블 추가 (전문 분야별 강연 주제 관리)
CREATE TABLE IF NOT EXISTS speaker_topics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  speaker_id text NOT NULL REFERENCES speakers(id) ON DELETE CASCADE,
  subcategory_id text REFERENCES subcategories(id) ON DELETE SET NULL,
  topic_text text NOT NULL,
  sort_order int DEFAULT 0
);
CREATE INDEX IF NOT EXISTS speaker_topics_speaker_idx ON speaker_topics(speaker_id);

-- 기존 speakers.topics 배열 데이터를 speaker_topics로 마이그레이션
-- (subcategory_id = NULL 로 삽입, 이미 데이터가 있는 강사는 건너뜀)
INSERT INTO speaker_topics (speaker_id, subcategory_id, topic_text, sort_order)
SELECT s.id, NULL, t.topic, (t.ord - 1)::int
FROM speakers s
CROSS JOIN LATERAL unnest(s.topics) WITH ORDINALITY AS t(topic, ord)
WHERE s.deleted_at IS NULL
  AND s.topics IS NOT NULL
  AND array_length(s.topics, 1) > 0
  AND NOT EXISTS (SELECT 1 FROM speaker_topics st WHERE st.speaker_id = s.id);

-- ============================================================
-- 완료 확인 쿼리
-- ============================================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('speaker_private', 'inquiries')
  AND column_name IN ('desired_fee', 'region', 'desired_time')
ORDER BY table_name, column_name;

SELECT COUNT(*) AS speaker_topics_count FROM speaker_topics;
