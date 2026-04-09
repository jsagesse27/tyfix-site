-- ============================================================
-- Homepage Section Manager — Visibility & Order
-- ============================================================

CREATE TABLE IF NOT EXISTS homepage_sections (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

-- Public read access (homepage needs to fetch this)
CREATE POLICY "Public can read homepage sections" ON homepage_sections
  FOR SELECT USING (true);

-- Auth users can update (admin dashboard)
CREATE POLICY "Auth users can update homepage sections" ON homepage_sections
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Seed default section layout
INSERT INTO homepage_sections (id, label, sort_order, is_visible) VALUES
  ('hero',              'Hero Banner',          0,  true),
  ('trust_badges',      'Trust Badges',         1,  true),
  ('featured_vehicles', 'Featured Vehicles',    2,  true),
  ('request_vehicle',   'Request a Vehicle',    3,  true),
  ('cash_advantage',    'Cash Advantage',       4,  true),
  ('cash_calculator',   'Cash Calculator',      5,  true),
  ('autoconnect',       'AutoConnect Program',  6,  true),
  ('testimonials',      'Testimonials',         7,  true),
  ('social_bridge',     'Social Bridge',        8,  true),
  ('sell_your_car',     'Sell Us Your Car',      9,  true),
  ('contact',           'Contact Section',      10, true)
ON CONFLICT (id) DO NOTHING;
