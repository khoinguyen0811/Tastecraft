-- Thêm cột forced_hidden vào recipes (admin buộc ẩn, user không thể bật lại)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS forced_hidden BOOLEAN DEFAULT false;

-- Bảng thông báo
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,         -- 'report_received' | 'report_actioned' | 'recipe_hidden'
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,                  -- link dẫn đến công thức hoặc trang liên quan
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notif_insert_admin" ON notifications FOR INSERT WITH CHECK (true);
