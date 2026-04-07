-- Chạy script này trên Supabase Dashboard > SQL Editor
-- Mục đích: đổi cột id của bảng users từ BIGINT sang UUID để khớp với Supabase Auth

-- Bước 1: Xóa bảng cũ (nếu chưa có data quan trọng)
-- Nếu đã có data, cần migrate thủ công
DROP TABLE IF EXISTS recipe_tag CASCADE;
DROP TABLE IF EXISTS saved_recipes CASCADE;
DROP TABLE IF EXISTS recipe_feedbacks CASCADE;
DROP TABLE IF EXISTS recipe_steps CASCADE;
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Bước 2: Tạo lại bảng users với UUID
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

CREATE TABLE recipe_ingredients (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
    name VARCHAR(255),
    quantity VARCHAR(50)
);

CREATE TABLE recipe_steps (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
    step_num INT,
    content TEXT,
    step_image VARCHAR(255)
);

CREATE TABLE recipe_feedbacks (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    result_image VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE saved_recipes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, recipe_id)
);

CREATE TABLE tags (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(50) NOT NULL,
    type TEXT CHECK (type IN ('method', 'diet', 'time')),
    slug VARCHAR(50) UNIQUE
);

CREATE TABLE recipe_tag (
    recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
    tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, tag_id)
);

-- Bước 3: RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_all" ON users FOR SELECT USING (true);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "saved_select_own" ON saved_recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_insert_own" ON saved_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_delete_own" ON saved_recipes FOR DELETE USING (auth.uid() = user_id);
