-- Bảng báo cáo vi phạm công thức
CREATE TABLE IF NOT EXISTS recipe_reports (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,        -- lý do chọn sẵn hoặc "Khác"
  note TEXT,                   -- nội dung user nhập khi chọn "Khác"
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE recipe_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_insert_auth" ON recipe_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reports_select_admin" ON recipe_reports FOR SELECT USING (true);
CREATE POLICY "reports_update_admin" ON recipe_reports FOR UPDATE USING (true);
