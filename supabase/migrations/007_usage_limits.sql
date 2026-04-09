-- ============================================================
-- 007 - AI & Admin Usage Limit Configuration
-- ============================================================

-- Add rate limiting configuration to bot_settings
ALTER TABLE bot_settings
ADD COLUMN IF NOT EXISTS rate_limit_enabled BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS rate_limit_requests INTEGER NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS rate_limit_window_minutes INTEGER NOT NULL DEFAULT 5;

-- Add admin dashboard performance configuration to site_settings
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS admin_leads_per_page INTEGER NOT NULL DEFAULT 150,
ADD COLUMN IF NOT EXISTS admin_inventory_per_page INTEGER NOT NULL DEFAULT 200;
