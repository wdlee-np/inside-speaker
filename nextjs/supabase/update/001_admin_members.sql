-- ============================================================
-- 001_admin_members.sql
-- admin_users 비활성화 지원 + is_admin() 업데이트
-- Supabase SQL Editor에 붙여넣기 후 실행
-- ============================================================

-- 비활성화 컬럼 추가 (이미 존재하면 무시)
ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS disabled_at TIMESTAMPTZ;

-- is_admin(): 비활성화된 관리자 제외
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
      AND disabled_at IS NULL
  )
$$;
