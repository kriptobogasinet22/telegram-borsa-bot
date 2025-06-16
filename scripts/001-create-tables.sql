-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    is_member BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    stock_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, stock_code)
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
    ('main_channel_link', '@your_channel'),
    ('main_channel_id', '-1001234567890')
ON CONFLICT (key) DO NOTHING;

-- Insert admin user (replace with your Telegram user ID)
INSERT INTO admin_users (user_id, username) VALUES 
    (123456789, 'admin_username')
ON CONFLICT (user_id) DO NOTHING;
