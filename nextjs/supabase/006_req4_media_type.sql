-- ============================================================
-- REQ-4: speaker_videos에 media_type 컬럼 추가 (영상/음성 구분)
-- ROLLBACK: ALTER TABLE speaker_videos DROP COLUMN media_type;
-- ============================================================
ALTER TABLE speaker_videos
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'video'
    CHECK (media_type IN ('video','audio','youtube'));

-- 기존 데이터: youtube URL이면 youtube, 나머지는 video로 설정
UPDATE speaker_videos
SET media_type = CASE
  WHEN video_url ILIKE '%youtube.com%' OR video_url ILIKE '%youtu.be%' THEN 'youtube'
  ELSE 'video'
END
WHERE media_type = 'video';
