-- ============================================================
-- TyFix AI Bot Settings Table
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

CREATE TABLE IF NOT EXISTS bot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Simple Settings
  bot_name TEXT NOT NULL DEFAULT 'Ty',
  bot_personality TEXT NOT NULL DEFAULT 'Friendly, straight-talking car enthusiast who genuinely cares about helping people find the right car. Brooklyn through-and-through.',
  dealership_name TEXT NOT NULL DEFAULT 'TyFix Used Cars',
  dealership_location TEXT NOT NULL DEFAULT 'Coney Island, Brooklyn, NY 11224',
  payment_model TEXT NOT NULL DEFAULT 'cash-only',
  price_range TEXT NOT NULL DEFAULT 'Most cars under $7,500',
  greeting_message TEXT NOT NULL DEFAULT 'Hey! 👋 I''m Ty from TyFix Used Cars. Whether you''re looking for a specific ride or just browsing, I got you. What''s on your mind?',
  allow_price_negotiation BOOLEAN NOT NULL DEFAULT false,
  collect_leads BOOLEAN NOT NULL DEFAULT true,
  bot_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Advanced Settings
  system_prompt_override TEXT DEFAULT NULL,
  banned_phrases TEXT NOT NULL DEFAULT 'Great question!, I''d be happy to help!, I understand your concern, That''s a great question, At the end of the day, Absolutely!, No worries!, Perfect!, Let me know if you have any questions, Is there anything else I can help with?',
  appointment_nudges TEXT NOT NULL DEFAULT 'Want to swing by and see it? I can set it up.|Nothing beats seeing it up close — when works for you?|I could hold this one for you. Got time this week?|A quick test drive would tell you everything.|Come see it — worst case you get a free cup of coffee ☕|You gotta feel this car in person.',
  custom_instructions TEXT DEFAULT NULL,
  temperature REAL NOT NULL DEFAULT 0.8,
  max_tokens INTEGER NOT NULL DEFAULT 300,
  frequency_penalty REAL NOT NULL DEFAULT 0.5,
  presence_penalty REAL NOT NULL DEFAULT 0.4,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed one default row
INSERT INTO bot_settings (id) VALUES (gen_random_uuid());

-- Enable RLS
ALTER TABLE bot_settings ENABLE ROW LEVEL SECURITY;

-- Allow anon users to read (needed for the public chatbot greeting fetch)
CREATE POLICY "Anyone can view bot_settings"
  ON bot_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated admin users can update
CREATE POLICY "Authenticated users can update bot_settings"
  ON bot_settings FOR UPDATE
  TO authenticated
  USING (true);
