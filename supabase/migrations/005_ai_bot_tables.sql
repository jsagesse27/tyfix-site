-- ============================================================
-- TyFix — Migration 005: AI Bot Tables
-- conversations, chat_messages, appointments
-- ============================================================

-- ============================
-- 1. CONVERSATIONS table
-- ============================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  source_channel TEXT NOT NULL DEFAULT 'web_chat'
    CHECK (source_channel IN ('web_chat', 'phone', 'sms', 'instagram')),
  context JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_lead ON conversations(lead_id);

-- ============================
-- 2. CHAT_MESSAGES table
-- ============================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL DEFAULT '',
  tool_calls JSONB,
  tool_results JSONB,
  tokens_used INTEGER,
  provider TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);

-- ============================
-- 3. APPOINTMENTS table
-- ============================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  vehicle_interest TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- ============================
-- RLS Policies
-- ============================

-- Conversations: service role handles all ops (no public access needed)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service can manage conversations" ON conversations
  FOR ALL USING (true);

-- Chat Messages: service role handles all ops
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service can manage chat messages" ON chat_messages
  FOR ALL USING (true);

-- Appointments: public can insert (via bot), admin can manage
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can create appointments" ON appointments
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to appointments" ON appointments
  FOR ALL USING (auth.role() = 'authenticated');
