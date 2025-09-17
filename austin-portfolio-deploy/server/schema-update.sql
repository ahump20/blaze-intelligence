-- Update database schema to support Replit Auth
-- This adds the required session table and updates the users table

-- Create sessions table for Replit Auth (mandatory)
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR(255) PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- Create index for session expiration
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire);

-- Add Replit Auth fields to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500);

-- Update users table to allow id as VARCHAR (for Replit user IDs)
-- Note: This preserves existing UUID users while allowing Replit string IDs
-- The application will handle both formats

-- Create a trigger to automatically set full_name when first_name or last_name changes
CREATE OR REPLACE FUNCTION update_full_name_from_replit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL THEN
        NEW.full_name = TRIM(CONCAT(COALESCE(NEW.first_name, ''), ' ', COALESCE(NEW.last_name, '')));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update full_name automatically
DROP TRIGGER IF EXISTS update_full_name_replit_trigger ON users;
CREATE TRIGGER update_full_name_replit_trigger
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    WHEN (NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL)
    EXECUTE FUNCTION update_full_name_from_replit();

-- Rename existing sessions table to avoid conflicts
ALTER TABLE IF EXISTS sessions RENAME TO jwt_sessions;

-- Update any references to the old sessions table
UPDATE information_schema.tables SET table_name = 'jwt_sessions' WHERE table_name = 'sessions' AND table_schema = 'public';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON TABLE sessions TO postgres;
GRANT ALL PRIVILEGES ON TABLE users TO postgres;

-- Insert a comment to track this schema update
COMMENT ON TABLE sessions IS 'Replit Auth session storage - created for authentication integration';