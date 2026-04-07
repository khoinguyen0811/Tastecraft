-- Bảng sự kiện / thử thách
CREATE TABLE IF NOT EXISTS events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  banner_image VARCHAR(255),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng tham gia sự kiện
CREATE TABLE IF NOT EXISTS event_participants (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipe_id BIGINT REFERENCES recipes(id) ON DELETE SET NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (event_id, user_id)
);

-- RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_all" ON events FOR SELECT USING (true);
CREATE POLICY "events_insert_admin" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "events_update_admin" ON events FOR UPDATE USING (true);
CREATE POLICY "events_delete_admin" ON events FOR DELETE USING (true);

CREATE POLICY "ep_select_all" ON event_participants FOR SELECT USING (true);
CREATE POLICY "ep_insert_own" ON event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ep_delete_own" ON event_participants FOR DELETE USING (auth.uid() = user_id);
