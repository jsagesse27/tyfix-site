-- ============================================================
-- TyFix — Fix script (safe to re-run)
-- Drops all existing policies then recreates them + seeds data
-- ============================================================

-- Drop existing table policies
DROP POLICY IF EXISTS "Public can view active vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admin full access to vehicles" ON vehicles;
DROP POLICY IF EXISTS "Public can view vehicle photos" ON vehicle_photos;
DROP POLICY IF EXISTS "Admin full access to photos" ON vehicle_photos;
DROP POLICY IF EXISTS "Public can submit leads" ON leads;
DROP POLICY IF EXISTS "Admin full access to leads" ON leads;
DROP POLICY IF EXISTS "Public can view visible testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admin full access to testimonials" ON testimonials;
DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;
DROP POLICY IF EXISTS "Admin full access to settings" ON site_settings;
DROP POLICY IF EXISTS "Public can view site content" ON site_content;
DROP POLICY IF EXISTS "Admin full access to content" ON site_content;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Public can view vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete vehicle photos" ON storage.objects;

-- ============================
-- Recreate RLS policies
-- ============================
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active vehicles" ON vehicles
  FOR SELECT USING (listing_status = 'active');
CREATE POLICY "Admin full access to vehicles" ON vehicles
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE vehicle_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view vehicle photos" ON vehicle_photos
  FOR SELECT USING (true);
CREATE POLICY "Admin full access to photos" ON vehicle_photos
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can submit leads" ON leads
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to leads" ON leads
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view visible testimonials" ON testimonials
  FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin full access to testimonials" ON testimonials
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view site settings" ON site_settings
  FOR SELECT USING (true);
CREATE POLICY "Admin full access to settings" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view site content" ON site_content
  FOR SELECT USING (true);
CREATE POLICY "Admin full access to content" ON site_content
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================
-- Storage bucket + policies
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
-- Seed data (skip if exists)
-- ============================
INSERT INTO site_settings (
  phone_number, sms_number, contact_email, lot_address,
  hours_of_operation, footer_text, price_tagline_text, primary_color
) SELECT
  '(555) 123-4567', '5551234567', 'info@tyfixauto.com',
  '123 Auto Mall Dr, Houston, TX 77001',
  'Mon - Sat: 9:00 AM - 6:00 PM | Sunday: Closed',
  'Providing reliable, affordable transportation to the Houston community.',
  'The price you see is the price you pay.',
  '#8B0000'
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);

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

-- Sample vehicles (skip duplicates by checking count)
INSERT INTO vehicles (year, make, model, mileage, price, body_type, transmission, condition_notes, inspection_status, listing_status, featured_label)
SELECT * FROM (VALUES
  ('2012', 'Honda', 'Civic', 115000, 6500, 'Sedan', 'Automatic', 'Reliable commuter car, well-maintained, cold A/C.', 'pass', 'active', 'Just Arrived'),
  ('2010', 'Toyota', 'Corolla', 128000, 5900, 'Sedan', 'Automatic', 'One owner, clean title, great on gas.', 'pass', 'active', NULL),
  ('2014', 'Ford', 'Fusion', 98000, 7200, 'Sedan', 'Automatic', 'Loaded with features, smooth ride, new tires.', 'pass', 'active', 'Just Arrived'),
  ('2013', 'Nissan', 'Altima', 105000, 6800, 'Sedan', 'Automatic', 'Clean interior, reliable transportation.', 'pass', 'active', NULL),
  ('2011', 'Hyundai', 'Elantra', 135000, 5400, 'Sedan', 'Automatic', 'Budget friendly, mechanically sound.', 'pass', 'active', NULL),
  ('2012', 'Chevrolet', 'Malibu', 110000, 6200, 'Sedan', 'Automatic', 'Comfortable sedan, ready for the road.', 'pass', 'active', NULL)
) AS v(year, make, model, mileage, price, body_type, transmission, condition_notes, inspection_status, listing_status, featured_label)
WHERE NOT EXISTS (SELECT 1 FROM vehicles LIMIT 1);

-- Sample testimonials (skip if already seeded)
INSERT INTO testimonials (name, star_rating, review_text, date_label, is_visible)
SELECT * FROM (VALUES
  ('Kevin Yang', 5, 'Found a great deal on a Honda Civic. Straightforward process, no hidden fees. The cash-only model made it quick and easy.', 'March 2026', true),
  ('Sarah Miller', 5, 'TyFix is the real deal. Honest about the car''s condition and the price was unbeatable for the quality.', 'February 2026', true),
  ('James Wilson', 4, 'I was nervous about buying from a lot, but TyFix made it simple. The 25-point check gave me peace of mind.', 'January 2026', true)
) AS t(name, star_rating, review_text, date_label, is_visible)
WHERE NOT EXISTS (SELECT 1 FROM testimonials LIMIT 1);
