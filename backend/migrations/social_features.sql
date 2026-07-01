CREATE TABLE IF NOT EXISTS recipe_likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    recipe_id INTEGER NOT NULL REFERENCES recipes(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_recipe_like_user_recipe UNIQUE (user_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS saved_recipes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    recipe_id INTEGER NOT NULL REFERENCES recipes(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_saved_recipe_user_recipe UNIQUE (user_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS user_follows (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER NOT NULL REFERENCES users(id),
    following_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_follow_pair UNIQUE (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS recipe_comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    recipe_id INTEGER NOT NULL REFERENCES recipes(id),
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_photos (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id),
    image_url VARCHAR(500) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL REFERENCES users(id),
    user2_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_chat_user_pair UNIQUE (user1_id, user2_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES chats(id),
    sender_id INTEGER NOT NULL REFERENCES users(id),
    text TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS category VARCHAR(100);
UPDATE recipes
SET category = COALESCE(NULLIF(category, ''), NULLIF(diet, ''), 'Other')
WHERE category IS NULL OR category = '';

ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS ix_recipe_likes_recipe_id ON recipe_likes(recipe_id);
CREATE INDEX IF NOT EXISTS ix_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS ix_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS ix_user_follows_following_id ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS ix_recipe_comments_recipe_id ON recipe_comments(recipe_id);
CREATE INDEX IF NOT EXISTS ix_recipe_photos_recipe_id ON recipe_photos(recipe_id);
CREATE INDEX IF NOT EXISTS ix_messages_chat_id ON messages(chat_id);
