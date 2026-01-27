-- Migration: Add 2FA and SSO support
-- Date: 2025-12-19
-- Description: Adds Two-Factor Authentication and Single Sign-On support

-- Add 2FA columns to users table (if not exists)
ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN two_factor_backup_codes TEXT;

-- Add 2FA columns to kiosk_users table (if not exists)
ALTER TABLE kiosk_users ADD COLUMN two_factor_secret TEXT;
ALTER TABLE kiosk_users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0;
ALTER TABLE kiosk_users ADD COLUMN two_factor_backup_codes TEXT;

-- Create SSO configuration table
CREATE TABLE IF NOT EXISTS sso_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL UNIQUE,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  scope TEXT DEFAULT 'openid email profile',
  enabled INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create user SSO links table
CREATE TABLE IF NOT EXISTS user_sso (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  email TEXT,
  name TEXT,
  picture TEXT,
  linked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, provider, provider_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_sso_user ON user_sso(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sso_provider ON user_sso(provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_sso_config_provider ON sso_config(provider);

