-- ============================================================
-- TyFix Auto Sales — Database Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Add slug column to vehicles table
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. Add tiktok_url to site_settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS tiktok_url TEXT;

-- 3. Add review source columns to testimonials
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'site';
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS google_review_url TEXT;

-- 4. Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author TEXT DEFAULT 'TyFix Team',
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable RLS on blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published posts
CREATE POLICY "Public can read published posts"
  ON blog_posts FOR SELECT
  USING (is_published = true);

-- Allow authenticated users full access (admin)
CREATE POLICY "Authenticated users can manage posts"
  ON blog_posts FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 6. Backfill slugs for existing vehicles
-- This generates slugs from existing vehicle data
UPDATE vehicles
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      CONCAT_WS('-', year, make, model, COALESCE(trim, ''), COALESCE(stock_number, '')),
      '[^a-zA-Z0-9\-]', '', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- 7. Update site_settings with social media URLs
-- (Run this to set the Instagram and Facebook URLs)
UPDATE site_settings
SET
  instagram_url = 'https://www.instagram.com/_tyfix',
  facebook_url = 'https://www.facebook.com/tyfixconsultations'
WHERE id = (SELECT id FROM site_settings LIMIT 1);

-- 8. Done! Verify:
-- SELECT slug, year, make, model FROM vehicles LIMIT 10;
-- SELECT instagram_url, facebook_url, tiktok_url FROM site_settings LIMIT 1;
-- SELECT * FROM blog_posts LIMIT 1;
