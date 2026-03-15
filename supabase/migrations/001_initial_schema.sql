-- ============================================================
-- TyFix Auto Sales — Initial Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ============================
-- 1. VEHICLES table
-- ============================
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  trim TEXT,
  mileage INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 0,
  cash_price INTEGER,
  internet_price INTEGER,
  msrp INTEGER,
  stock_number TEXT,
  vin TEXT,
  body_type TEXT NOT NULL DEFAULT 'Sedan',
  exterior_color TEXT,
  interior_color TEXT,
  transmission TEXT NOT NULL DEFAULT 'Automatic',
  engine TEXT,
  condition_notes TEXT,
  inspection_status TEXT CHECK (inspection_status IN ('pass', 'fail')),
  history_report_url TEXT,
  listing_status TEXT NOT NULL DEFAULT 'active' CHECK (listing_status IN ('active', 'sold', 'hidden')),
  featured_label TEXT,
  show_cash_price BOOLEAN NOT NULL DEFAULT false,
  show_internet_price BOOLEAN NOT NULL DEFAULT false,
  show_msrp BOOLEAN NOT NULL DEFAULT false,
  show_call_for_price BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================
-- 2. VEHICLE_PHOTOS table
-- ============================
CREATE TABLE IF NOT EXISTS vehicle_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================
-- 3. LEADS table
-- ============================
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  message TEXT,
  vehicle_of_interest TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================
-- 4. TESTIMONIALS table
-- ============================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  star_rating INTEGER NOT NULL DEFAULT 5 CHECK (star_rating >= 1 AND star_rating <= 5),
  review_text TEXT NOT NULL,
  date_label TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================
-- 5. SITE_SETTINGS table (singleton)
-- ============================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL DEFAULT '(555) 123-4567',
  sms_number TEXT NOT NULL DEFAULT '5551234567',
  contact_email TEXT NOT NULL DEFAULT 'info@tyfixauto.com',
  lot_address TEXT NOT NULL DEFAULT '123 Auto Mall Dr, Houston, TX 77001',
  hours_of_operation TEXT NOT NULL DEFAULT 'Mon - Sat: 9:00 AM - 6:00 PM | Sunday: Closed',
  google_maps_embed_url TEXT,
  directions_note TEXT,
  footer_text TEXT NOT NULL DEFAULT 'Providing reliable, affordable transportation to the Houston community.',
  legal_disclaimer TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  google_reviews_embed TEXT,
  show_reviews_section BOOLEAN NOT NULL DEFAULT true,
  show_price_tagline BOOLEAN NOT NULL DEFAULT true,
  price_tagline_text TEXT NOT NULL DEFAULT 'The price you see is the price you pay.',
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#8B0000',
  font_family TEXT NOT NULL DEFAULT 'Inter',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================
-- 6. SITE_CONTENT table (key-value)
-- ============================
CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL UNIQUE,
  content_value TEXT NOT NULL DEFAULT '',
  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'image_url')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================
-- Row Level Security (RLS)
-- ============================

-- Vehicles: public can read active, admin can CRUD
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active vehicles" ON vehicles
  FOR SELECT USING (listing_status = 'active');
CREATE POLICY "Admin full access to vehicles" ON vehicles
  FOR ALL USING (auth.role() = 'authenticated');

-- Vehicle Photos: public can read, admin can CRUD
ALTER TABLE vehicle_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view vehicle photos" ON vehicle_photos
  FOR SELECT USING (true);
CREATE POLICY "Admin full access to photos" ON vehicle_photos
  FOR ALL USING (auth.role() = 'authenticated');

-- Leads: public can insert, admin can read/update
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can submit leads" ON leads
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to leads" ON leads
  FOR ALL USING (auth.role() = 'authenticated');

-- Testimonials: public can read visible, admin can CRUD
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view visible testimonials" ON testimonials
  FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin full access to testimonials" ON testimonials
  FOR ALL USING (auth.role() = 'authenticated');

-- Site Settings: public can read, admin can update
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view site settings" ON site_settings
  FOR SELECT USING (true);
CREATE POLICY "Admin full access to settings" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Site Content: public can read, admin can update
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view site content" ON site_content
  FOR SELECT USING (true);
CREATE POLICY "Admin full access to content" ON site_content
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================
-- Storage Bucket
-- ============================
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-photos', 'vehicle-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view vehicle photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'vehicle-photos');
CREATE POLICY "Admin can upload vehicle photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'vehicle-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Admin can update vehicle photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'vehicle-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Admin can delete vehicle photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'vehicle-photos' AND auth.role() = 'authenticated');

-- ============================
-- Seed: Default site settings row
-- ============================
INSERT INTO site_settings (
  phone_number, sms_number, contact_email, lot_address,
  hours_of_operation, footer_text, price_tagline_text, primary_color
) VALUES (
  '(555) 123-4567', '5551234567', 'info@tyfixauto.com',
  '123 Auto Mall Dr, Houston, TX 77001',
  'Mon - Sat: 9:00 AM - 6:00 PM | Sunday: Closed',
  'Providing reliable, affordable transportation to the Houston community.',
  'The price you see is the price you pay.',
  '#8B0000'
);

-- ============================
-- Seed: Default site content
-- ============================
INSERT INTO site_content (content_key, content_value, content_type) VALUES
  ('homepage_tagline', 'Reliable Cars. Cash Prices. No Games.', 'text'),
  ('homepage_headline', 'Quality Vehicles Under $7,500', 'text'),
  ('homepage_subheadline', 'No credit checks. No interest. No monthly payments. Pay cash and drive away today in a vehicle you can trust.', 'text'),
  ('about_title', 'The TyFix Cash Advantage', 'text'),
  ('about_text', 'At TyFix Auto Sales, we believe car shopping should be simple and honest. Every vehicle on our lot passes a rigorous 25-point mechanical inspection. We price fairly, we do not charge hidden fees, and we let our cars speak for themselves.', 'text'),
  ('cash_advantage_1_title', 'No Credit Checks', 'text'),
  ('cash_advantage_1_desc', 'Your credit score does not matter here. If you have the cash, you have the car.', 'text'),
  ('cash_advantage_2_title', 'No Interest Payments', 'text'),
  ('cash_advantage_2_desc', 'Why pay thousands in interest to a bank? Own your car outright from day one.', 'text'),
  ('cash_advantage_3_title', 'Lower Insurance Costs', 'text'),
  ('cash_advantage_3_desc', 'Owning your vehicle means you are not forced into expensive full-coverage plans required by lenders.', 'text'),
  ('cash_advantage_4_title', 'Transparent History', 'text'),
  ('cash_advantage_4_desc', 'We provide full vehicle history reports and are honest about every dent and scratch.', 'text'),
  ('trust_badge_1_title', 'TyFix 25-Point Check', 'text'),
  ('trust_badge_1_desc', 'Every vehicle passes a rigorous mechanical inspection before it hits the lot.', 'text'),
  ('trust_badge_2_title', 'No Hidden Fees', 'text'),
  ('trust_badge_2_desc', 'The price you see is the price you pay. No doc fees, no admin fees, no surprises.', 'text'),
  ('trust_badge_3_title', 'Drive Today', 'text'),
  ('trust_badge_3_desc', 'Cash-only means no waiting for bank approvals. Sign the papers and drive away in minutes.', 'text'),
  ('hero_image_url', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920', 'image_url'),
  ('footer_about', 'Providing reliable, affordable transportation to the Houston community since 2015. Straightforward cash sales, no games.', 'text')
ON CONFLICT (content_key) DO NOTHING;

-- ============================
-- Seed: Sample vehicles
-- ============================
INSERT INTO vehicles (year, make, model, mileage, price, body_type, transmission, condition_notes, inspection_status, listing_status, featured_label) VALUES
  ('2012', 'Honda', 'Civic', 115000, 6500, 'Sedan', 'Automatic', 'Reliable commuter car, well-maintained, cold A/C.', 'pass', 'active', 'Just Arrived'),
  ('2010', 'Toyota', 'Corolla', 128000, 5900, 'Sedan', 'Automatic', 'One owner, clean title, great on gas.', 'pass', 'active', NULL),
  ('2014', 'Ford', 'Fusion', 98000, 7200, 'Sedan', 'Automatic', 'Loaded with features, smooth ride, new tires.', 'pass', 'active', 'Just Arrived'),
  ('2013', 'Nissan', 'Altima', 105000, 6800, 'Sedan', 'Automatic', 'Clean interior, reliable transportation.', 'pass', 'active', NULL),
  ('2011', 'Hyundai', 'Elantra', 135000, 5400, 'Sedan', 'Automatic', 'Budget friendly, mechanically sound.', 'pass', 'active', NULL),
  ('2012', 'Chevrolet', 'Malibu', 110000, 6200, 'Sedan', 'Automatic', 'Comfortable sedan, ready for the road.', 'pass', 'active', NULL);

-- ============================
-- Seed: Sample testimonials
-- ============================
INSERT INTO testimonials (name, star_rating, review_text, date_label, is_visible) VALUES
  ('Kevin Yang', 5, 'Found a great deal on a Honda Civic. Straightforward process, no hidden fees. The cash-only model made it quick and easy.', 'March 2026', true),
  ('Sarah Miller', 5, 'TyFix is the real deal. Honest about the car''s condition and the price was unbeatable for the quality.', 'February 2026', true),
  ('James Wilson', 4, 'I was nervous about buying from a lot, but TyFix made it simple. The 25-point check gave me peace of mind.', 'January 2026', true);
