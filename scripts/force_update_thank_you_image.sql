-- Update by ID (Most reliable if ID matches code)
UPDATE email_templates
SET image_url = 'http://www.vallartavows.com/wp-content/uploads/2026/02/thank-you-hero-email.png',
    updated_at = NOW()
WHERE id = 'thankyou';

-- Update by Title (Exact match from screenshot)
UPDATE email_templates
SET image_url = 'http://www.vallartavows.com/wp-content/uploads/2026/02/thank-you-hero-email.png',
    updated_at = NOW()
WHERE title = 'Thank you Email Template';

-- Update by Title (Variation mentioned in chat)
UPDATE email_templates
SET image_url = 'http://www.vallartavows.com/wp-content/uploads/2026/02/thank-you-hero-email.png',
    updated_at = NOW()
WHERE title = 'Thank you - Vallarta Vows';
