-- PPL 광고 관리 시스템 Supabase 스키마
-- Supabase SQL Editor에서 실행하세요

-- 캠페인 테이블
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id TEXT UNIQUE NOT NULL,
  campaign_name TEXT NOT NULL,
  advertiser_name TEXT NOT NULL,
  budget INTEGER NOT NULL DEFAULT 0,
  agency_name TEXT DEFAULT '',
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_impression INTEGER,
  gender_target TEXT DEFAULT '',
  age_target TEXT DEFAULT '',
  daily_limit INTEGER,
  frequency TEXT NOT NULL DEFAULT 'campaign_once',
  status TEXT NOT NULL DEFAULT 'paused' CHECK (status IN ('normal', 'paused', 'inactive')),
  total_completed_impression INTEGER NOT NULL DEFAULT 0,
  total_video_impression INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 소재 테이블
CREATE TABLE IF NOT EXISTS creatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creative_id TEXT UNIQUE NOT NULL,
  campaign_id TEXT NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
  video_title TEXT NOT NULL,
  mux_playback_id TEXT NOT NULL,
  tags TEXT DEFAULT '',
  quiz_question TEXT NOT NULL DEFAULT '',
  quiz_answer TEXT NOT NULL DEFAULT '',
  quiz_wrong_answers TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 리포트 로그 테이블 (데모 시드 데이터)
CREATE TABLE IF NOT EXISTS report_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_id TEXT UNIQUE NOT NULL,
  campaign_id TEXT NOT NULL,
  creative_id TEXT NOT NULL,
  log_date DATE NOT NULL,
  video_impression INTEGER NOT NULL DEFAULT 0,
  completed_impression INTEGER NOT NULL DEFAULT 0,
  video_unique_users INTEGER NOT NULL DEFAULT 0,
  completed_unique_users INTEGER NOT NULL DEFAULT 0
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_creatives_campaign_id ON creatives(campaign_id);
CREATE INDEX IF NOT EXISTS idx_report_logs_campaign_id ON report_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_report_logs_creative_id ON report_logs(creative_id);
CREATE INDEX IF NOT EXISTS idx_report_logs_log_date ON report_logs(log_date);

-- RLS 비활성화 (데모용)
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE creatives DISABLE ROW LEVEL SECURITY;
ALTER TABLE report_logs DISABLE ROW LEVEL SECURITY;
