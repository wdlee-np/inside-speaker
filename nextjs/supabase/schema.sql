-- ============================================================
-- Inside Speakers — Supabase Schema
-- 실행 순서: Supabase SQL Editor에 전체 붙여넣기 후 실행
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── 1. categories (대분류) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  label_en    TEXT,
  description TEXT,
  sort_order  INT  DEFAULT 0
);

-- ── 2. subcategories (소분류) ────────────────────────────────
CREATE TABLE IF NOT EXISTS subcategories (
  id          TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  label       TEXT NOT NULL,
  sort_order  INT  DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 3. speakers ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS speakers (
  id              TEXT PRIMARY KEY,
  name            TEXT        NOT NULL,
  name_en         TEXT,
  title           TEXT        NOT NULL,
  tagline         TEXT,
  portrait_url    TEXT,
  hero_color      TEXT        DEFAULT '#2c2a26',
  fee_level       TEXT        NOT NULL CHECK (fee_level IN ('S','A','B','C')),
  featured        BOOLEAN     DEFAULT FALSE,
  display_order   INT         DEFAULT 0,
  stats_talks     INT         DEFAULT 0,
  stats_companies INT         DEFAULT 0,
  stats_years     INT         DEFAULT 0,
  topics          TEXT[]      DEFAULT '{}',
  bio             TEXT[]      DEFAULT '{}',
  recommended_ids TEXT[]      DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

-- ── 4. speaker_subcategories (N:M) ───────────────────────────
CREATE TABLE IF NOT EXISTS speaker_subcategories (
  speaker_id     TEXT NOT NULL REFERENCES speakers(id) ON DELETE CASCADE,
  subcategory_id TEXT NOT NULL REFERENCES subcategories(id) ON DELETE RESTRICT,
  PRIMARY KEY (speaker_id, subcategory_id)
);

-- ── 5. speaker_videos ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS speaker_videos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  speaker_id TEXT NOT NULL REFERENCES speakers(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  duration   TEXT,
  thumb_url  TEXT,
  video_url  TEXT NOT NULL,
  sort_order INT  DEFAULT 0
);

-- ── 6. speaker_reviews ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS speaker_reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  speaker_id TEXT NOT NULL REFERENCES speakers(id) ON DELETE CASCADE,
  company    TEXT NOT NULL,
  author     TEXT,
  quote      TEXT NOT NULL,
  sort_order INT  DEFAULT 0
);

-- ── 7. speaker_careers ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS speaker_careers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  speaker_id TEXT NOT NULL REFERENCES speakers(id) ON DELETE CASCADE,
  year       TEXT NOT NULL,
  role       TEXT NOT NULL,
  sort_order INT  DEFAULT 0
);

-- ── 8. inquiries ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inquiries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company         TEXT NOT NULL,
  department      TEXT,
  contact_name    TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT NOT NULL,
  desired_speaker TEXT REFERENCES speakers(id) ON DELETE SET NULL,
  desired_date    TEXT,
  budget_range    TEXT,
  message         TEXT,
  status          TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','won','lost')),
  internal_memo   TEXT,
  source_url      TEXT,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 9. admin_users ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role         TEXT DEFAULT 'editor' CHECK (role IN ('owner','editor')),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_speakers_featured
  ON speakers(featured) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_speakers_display_order
  ON speakers(display_order) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_speakers_name_trgm
  ON speakers USING gin(name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_speakers_deleted_at
  ON speakers(deleted_at);

CREATE INDEX IF NOT EXISTS idx_inquiries_status
  ON inquiries(status);

CREATE INDEX IF NOT EXISTS idx_inquiries_created
  ON inquiries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_speaker_subcategories_sub
  ON speaker_subcategories(subcategory_id);

-- ── updated_at auto-trigger ──────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_speakers_updated_at
  BEFORE UPDATE ON speakers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── RLS: Enable ──────────────────────────────────────────────
ALTER TABLE categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaker_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaker_videos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaker_reviews    ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaker_careers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users        ENABLE ROW LEVEL SECURITY;

-- ── RLS: Public read ─────────────────────────────────────────
CREATE POLICY "public_read_categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "public_read_subcategories" ON subcategories
  FOR SELECT USING (true);

CREATE POLICY "public_read_speakers" ON speakers
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "public_read_speaker_subcategories" ON speaker_subcategories
  FOR SELECT USING (true);

CREATE POLICY "public_read_speaker_videos" ON speaker_videos
  FOR SELECT USING (true);

CREATE POLICY "public_read_speaker_reviews" ON speaker_reviews
  FOR SELECT USING (true);

CREATE POLICY "public_read_speaker_careers" ON speaker_careers
  FOR SELECT USING (true);

-- ── Helper: is_admin() ───────────────────────────────────────
-- SECURITY DEFINER로 RLS를 우회하여 admin_users 자기참조 재귀 방지
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
$$;

-- ── RLS: Admin write ─────────────────────────────────────────
CREATE POLICY "admin_all_categories" ON categories
  FOR ALL USING (is_admin());

CREATE POLICY "admin_all_subcategories" ON subcategories
  FOR ALL USING (is_admin());

CREATE POLICY "admin_all_speakers" ON speakers
  FOR ALL USING (is_admin());

CREATE POLICY "admin_all_speaker_subcategories" ON speaker_subcategories
  FOR ALL USING (is_admin());

CREATE POLICY "admin_all_speaker_videos" ON speaker_videos
  FOR ALL USING (is_admin());

CREATE POLICY "admin_all_speaker_reviews" ON speaker_reviews
  FOR ALL USING (is_admin());

CREATE POLICY "admin_all_speaker_careers" ON speaker_careers
  FOR ALL USING (is_admin());

-- ── RLS: Inquiries ───────────────────────────────────────────
CREATE POLICY "public_insert_inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_all_inquiries" ON inquiries
  FOR ALL USING (is_admin());

-- ── RLS: Admin users ─────────────────────────────────────────
CREATE POLICY "admin_read_own" ON admin_users
  FOR SELECT USING (auth.uid() = id OR is_admin());

-- ── Seed: Categories ─────────────────────────────────────────
INSERT INTO categories (id, label, label_en, description, sort_order) VALUES
  ('competency',    '직무 역량',   'Core Competency', '조직의 성과와 직결되는 실전 역량',          1),
  ('future-tech',   '미래 기술',   'Future Tech',     '변화의 속도를 읽는 기술 인사이트',           2),
  ('humanities',    '인문/소양',   'Humanities',      '사람과 조직을 움직이는 본질의 언어',         3),
  ('economy-life',  '경제/라이프', 'Economy & Life',  '일하는 사람의 삶 전반을 설계하는 시야',      4)
ON CONFLICT (id) DO NOTHING;

-- ── Seed: Subcategories ──────────────────────────────────────
INSERT INTO subcategories (id, category_id, label, sort_order) VALUES
  ('leadership',       'competency',   '리더십',                   1),
  ('hr-org',           'competency',   '인사/조직관리',              2),
  ('sales-marketing',  'competency',   '영업/마케팅',               3),
  ('strategy',         'competency',   '전략/기획',                 4),
  ('gen-ai',           'future-tech',  '생성형 AI 활용',             1),
  ('dx',               'future-tech',  '디지털 트랜스포메이션',       2),
  ('new-industry',     'future-tech',  '신산업 트렌드',              3),
  ('communication',    'humanities',   '비즈니스 커뮤니케이션',       1),
  ('mindfulness',      'humanities',   '심리/마인드풀니스',           2),
  ('esg',              'humanities',   'ESG/윤리경영',              3),
  ('macro-finance',    'economy-life', '거시경제/재테크',             1),
  ('self-dev',         'economy-life', '자기계발',                  2),
  ('health-wellbeing', 'economy-life', '건강/웰빙',                 3)
ON CONFLICT (id) DO NOTHING;
