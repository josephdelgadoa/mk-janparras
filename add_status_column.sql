-- Add 'status' column to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'New';

-- Update existing rows to have a status if they are null
UPDATE leads 
SET status = 'New' 
WHERE status IS NULL;
