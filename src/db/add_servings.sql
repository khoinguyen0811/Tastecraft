-- Thêm cột servings vào bảng recipes
-- Chạy trong Supabase Dashboard > SQL Editor

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS servings INT DEFAULT 2;
