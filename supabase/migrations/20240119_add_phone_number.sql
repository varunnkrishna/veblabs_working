-- Add phone number column to contact_submissions table
ALTER TABLE contact_submissions
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update existing rows with a placeholder value
UPDATE contact_submissions
SET phone = 'Not Provided'
WHERE phone IS NULL;

-- Make phone column required for new entries
ALTER TABLE contact_submissions
ALTER COLUMN phone SET NOT NULL;

-- Add a check constraint to ensure proper phone format for new entries
ALTER TABLE contact_submissions
ADD CONSTRAINT valid_phone_format 
CHECK (phone ~ '^\+[0-9]{1,4}[0-9]{6,14}$' OR phone = 'Not Provided');
