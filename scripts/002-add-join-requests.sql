-- Join requests table
CREATE TABLE IF NOT EXISTS join_requests (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    chat_id BIGINT NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    bio TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, declined
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by BIGINT,
    UNIQUE(user_id, chat_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON join_requests(status);
CREATE INDEX IF NOT EXISTS idx_join_requests_user_id ON join_requests(user_id);
