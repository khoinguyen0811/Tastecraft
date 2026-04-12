-- Thêm cột XP và rank vào users
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rank TEXT DEFAULT 'Bronze';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_shadow_banned BOOLEAN DEFAULT false;

-- Bảng log XP
CREATE TABLE IF NOT EXISTS user_points (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,   -- 'POST', 'COMMENT', 'LIKE', 'EVENT_JOIN', 'EVENT_WIN'
  points INT NOT NULL,
  ref_id TEXT,            -- id của recipe/comment/event liên quan
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "points_select_own" ON user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "points_insert_service" ON user_points FOR INSERT WITH CHECK (true);

-- Function tăng XP (atomic)
CREATE OR REPLACE FUNCTION increment_xp(user_uuid UUID, amount INT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_xp INT;
  new_rank TEXT;
BEGIN
  UPDATE users SET xp = xp + amount WHERE id = user_uuid
  RETURNING xp INTO new_xp;

  -- Tính rank mới
  IF new_xp >= 1500 THEN new_rank := 'Diamond';
  ELSIF new_xp >= 700 THEN new_rank := 'Platinum';
  ELSIF new_xp >= 300 THEN new_rank := 'Gold';
  ELSIF new_xp >= 100 THEN new_rank := 'Silver';
  ELSE new_rank := 'Bronze';
  END IF;

  UPDATE users SET rank = new_rank WHERE id = user_uuid;
END;
$$;
