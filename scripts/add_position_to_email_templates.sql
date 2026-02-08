-- Add position column to email_templates table
ALTER TABLE email_templates 
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Optional: Update existing records to have sequential position based on id order or created_at
-- This is a simple initialization
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY updated_at ASC) as rn
  FROM email_templates
)
UPDATE email_templates
SET position = numbered.rn
FROM numbered
WHERE email_templates.id = numbered.id;
