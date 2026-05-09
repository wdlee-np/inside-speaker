-- ============================================================
-- REQ-7: 카테고리 삭제 시 CASCADE 처리 + 대/소분류 추가/삭제 허용
-- ROLLBACK: FK를 다시 RESTRICT로 변경
-- ============================================================

-- subcategories.category_id: RESTRICT → CASCADE
ALTER TABLE subcategories
  DROP CONSTRAINT IF EXISTS subcategories_category_id_fkey;
ALTER TABLE subcategories
  ADD CONSTRAINT subcategories_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

-- speaker_subcategories.subcategory_id: RESTRICT → CASCADE
ALTER TABLE speaker_subcategories
  DROP CONSTRAINT IF EXISTS speaker_subcategories_subcategory_id_fkey;
ALTER TABLE speaker_subcategories
  ADD CONSTRAINT speaker_subcategories_subcategory_id_fkey
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE;

-- subcategories에 label_en 컬럼 추가 (소분류 영어 레이블)
ALTER TABLE subcategories
  ADD COLUMN IF NOT EXISTS label_en TEXT;
