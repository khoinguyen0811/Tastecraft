-- Thêm cột ban vào users
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP WITH TIME ZONE DEFAULT NULL;
-- NULL = không bị ban, có giá trị = bị ban đến thời điểm đó
