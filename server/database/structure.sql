-- Database structure for kerygma (PostgreSQL)
-- Run this script using populate.sh or directly with:
-- psql -U <user> -d <database_name> -f structure.sql

-- Drop tables in reverse order of dependencies (oauth_token depends on users)
DROP TABLE IF EXISTS oauth_token;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(255) DEFAULT NULL,
    password_hash VARCHAR(255) NOT NULL,
    color_theme VARCHAR(255) DEFAULT 'light',
    lang VARCHAR(255) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- OAuth tokens table
CREATE TABLE oauth_token (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    oath_token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_oauth_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_oauth_token_user_id ON oauth_token(user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at on row changes
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_token_updated_at
    BEFORE UPDATE ON oauth_token
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
