-- ============================================================
-- REQ-5: 강사 노출 상태 컬럼 추가
-- ROLLBACK: ALTER TABLE speakers DROP COLUMN speaker_status;
-- ============================================================
ALTER TABLE speakers
  ADD COLUMN IF NOT EXISTS speaker_status TEXT DEFAULT '미노출'
    CHECK (speaker_status IN ('노출','등록요청','미노출'));

-- 기존 등록 강사: 모두 '노출'로 설정 (요청사항 명시)
UPDATE speakers
SET speaker_status = '노출'
WHERE deleted_at IS NULL AND speaker_status = '미노출';

-- 공개 read 정책 수정: 노출 상태인 강사만 일반 사용자에게 공개
DROP POLICY IF EXISTS "public_read_speakers" ON speakers;
CREATE POLICY "public_read_speakers" ON speakers
  FOR SELECT USING (deleted_at IS NULL AND speaker_status = '노출');

-- 어드민은 모든 상태 조회 가능 (기존 admin_all_speakers 정책 유지)
