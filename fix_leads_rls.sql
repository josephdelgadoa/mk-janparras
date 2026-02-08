-- Fix for CRM Data Not Displaying
-- The previous policy only allowed "authenticated" users to see leads.
-- Since the dashboard uses the API Key without a login screen, we need to allow "anon" read access.

-- 1. Drop the old restrictive policy
DROP POLICY IF EXISTS "Enable select for authenticated users only" ON leads;

-- 2. Create a new policy allowing read access to everyone (including the dashboard)
CREATE POLICY "Enable select for everyone" ON leads FOR SELECT USING (true);

-- 3. Verify RLS is enabled (it should be, but good to ensure)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
