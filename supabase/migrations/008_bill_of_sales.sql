-- ============================================================
-- TyFix Auto Sales — 008 Bill of Sales & Dealer Signature
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ============================
-- 1. BILL_OF_SALES table
-- ============================
CREATE TABLE IF NOT EXISTS bill_of_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,

  -- Vehicle snapshot
  vehicle_year TEXT NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_vin TEXT,
  vehicle_stock_number TEXT,
  vehicle_mileage INTEGER,
  vehicle_color TEXT,
  vehicle_price INTEGER NOT NULL,

  -- Buyer info
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT,
  buyer_address TEXT,

  -- Sale details
  sale_price INTEGER NOT NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- File storage
  pdf_storage_path TEXT NOT NULL,
  pdf_public_url TEXT NOT NULL,

  -- Signature data (base64 PNG)
  buyer_signature_data TEXT,

  -- Tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: Admin only
ALTER TABLE bill_of_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access to bill_of_sales" 
  ON bill_of_sales FOR ALL USING (auth.role() = 'authenticated');

-- ============================
-- 2. Storage Bucket
-- ============================
INSERT INTO storage.buckets (id, name, public) 
  VALUES ('bill-of-sales', 'bill-of-sales', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admin can manage bill-of-sale files" 
  ON storage.objects FOR ALL 
  USING (bucket_id = 'bill-of-sales' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view bill-of-sale files" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'bill-of-sales');

-- ============================
-- 3. SITE_SETTINGS columns
-- ============================
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS dealer_signature_data TEXT,
  ADD COLUMN IF NOT EXISTS dealer_printed_name TEXT DEFAULT 'elite motors 1';
