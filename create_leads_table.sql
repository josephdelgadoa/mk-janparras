-- Create the leads table
CREATE TABLE leads (
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
  services_needed TEXT[], -- Array of strings for multiple selections
  message TEXT
);

-- Set up Row Level Security (RLS) - Optional but recommended
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for the public form)
-- You may need to enable "Enable read access to everyone" or similar depending on your exact auth setup
-- but for a public contact form, we usually want unauthenticated inserts.
CREATE POLICY "Enable insert for everyone" ON leads FOR INSERT WITH CHECK (true);

-- Policy: Allow read access only to authenticated users (admins) from the dashboard
-- Adjust this based on your actual auth roles
CREATE POLICY "Enable select for authenticated users only" ON leads FOR SELECT TO authenticated USING (true);
