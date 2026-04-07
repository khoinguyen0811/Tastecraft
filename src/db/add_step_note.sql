-- Thêm cột note vào recipe_steps
-- Chạy trong Supabase Dashboard > SQL Editor

ALTER TABLE recipe_steps ADD COLUMN IF NOT EXISTS note TEXT;
