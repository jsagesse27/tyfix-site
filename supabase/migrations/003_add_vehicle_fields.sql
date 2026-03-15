-- ============================================================
-- TyFix — Migration 003: Add fuel_type, drivetrain, cylinders
-- ============================================================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_type TEXT NOT NULL DEFAULT 'Gasoline';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS drivetrain TEXT NOT NULL DEFAULT 'FWD';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS cylinders TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS doors INTEGER NOT NULL DEFAULT 4;
