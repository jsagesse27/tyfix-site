-- Add new columns for the Lead Capture Popup (CTA) settings
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS show_lead_popup boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS lead_popup_title text DEFAULT 'Get $250 Off Your Next Car',
ADD COLUMN IF NOT EXISTS lead_popup_text text DEFAULT 'Sign up for alerts when new cars hit the lot';
