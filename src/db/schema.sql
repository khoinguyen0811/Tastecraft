-- ============================================================
-- Culinaria - Supabase PostgreSQL Schema
-- QUAN TRỌNG: Bảng users dùng UUID để khớp với Supabase Auth
-- Chạy trong Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Bảng Users (id = UUID từ auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) DEFAULT '',
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    bio TEXT,
    avatar VARCHAR(255) DEFAULT 'default_avatar.jpg',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Recipes
CREATE TABLE recipes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    image_main VARCHAR(255),
    description TEXT,
    cooking_time INT,
    difficulty TEXT CHECK (difficulty IN ('1', '2', '3')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Nguyên liệu
CREATE TABLE recipe_ingredients (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
    name VARCHAR(255),
    quantity VARCHAR(50)
);

-- 4. Các bước thực hiện
CREATE TABLE recipe_steps (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
    step_num INT,
    content TEXT,
    step_image VARCHAR(255)
);

-- 5. Feedback / Review
CREATE TABLE recipe_feedbacks (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    result_image VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Công thức đã lưu
CREATE TABLE saved_recipes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, recipe_id)
);

-- 7. Tags
CREATE TABLE tags (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(50) NOT NULL,
    type TEXT CHECK (type IN ('method', 'diet', 'time')),
    slug VARCHAR(50) UNIQUE
);

-- 8. Recipe_Tag
CREATE TABLE recipe_tag (
    recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
    tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, tag_id)
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- Users: ai cũng đọc được, chỉ sửa của mình
CREATE POLICY "users_select_all" ON users FOR SELECT USING (true);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);
-- Cho phép insert khi id khớp với auth user (dùng cho trigger)
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Saved recipes: chỉ thấy và sửa của mình
CREATE POLICY "saved_select_own" ON saved_recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_insert_own" ON saved_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_delete_own" ON saved_recipes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Trigger: tự động tạo profile khi có user mới đăng ký
-- Chạy với quyền SECURITY DEFINER nên bypass RLS
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, username, password)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    ''
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
