-- COMPLETE SETUP SCRIPT FOR LEADS TABLE
-- This script handles both table creation (safely) and policy setup.

-- 1. Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  partner1_first_name TEXT,
  partner1_last_name TEXT,
  partner1_gender TEXT,
  partner2_first_name TEXT,
  partner2_last_name TEXT,
  partner2_gender TEXT,
  email TEXT,
  phone TEXT,
  wedding_date DATE,
  guest_count INTEGER,
  budget_range TEXT,
  location_preference TEXT,
  referral_source TEXT,
  services_needed TEXT[],
  message TEXT
);

-- 2. Enable Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts causing errors
DROP POLICY IF EXISTS "Enable insert for everyone" ON leads;
DROP POLICY IF EXISTS "Enable select for authenticated users only" ON leads;
DROP POLICY IF EXISTS "Enable select for everyone" ON leads;
DROP POLICY IF EXISTS "Enable update for everyone" ON leads;
DROP POLICY IF EXISTS "Enable delete for everyone" ON leads;

-- 4. Create correct policies
-- Allow anyone (public form) to INSERT leads
CREATE POLICY "Enable insert for everyone" ON leads FOR INSERT WITH CHECK (true);

-- Allow anyone (dashboard) to READ leads
CREATE POLICY "Enable select for everyone" ON leads FOR SELECT USING (true);

-- Allow anyone to UPDATE/DELETE (for dashboard functionality)
CREATE POLICY "Enable update for everyone" ON leads FOR UPDATE USING (true);
CREATE POLICY "Enable delete for everyone" ON leads FOR DELETE USING (true);
