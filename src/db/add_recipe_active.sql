-- Thêm trạng thái active vào recipes
-- Chạy trong Supabase Dashboard > SQL Editor

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
