-- Thêm giới hạn số công thức mỗi user gửi vào event
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_recipes_per_user INT DEFAULT 2;
