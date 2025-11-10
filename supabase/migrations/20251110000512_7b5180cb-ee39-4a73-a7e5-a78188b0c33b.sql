-- Update app_role enum to include all required roles
-- First, check if the roles already exist, if not add them
DO $$ 
BEGIN
  -- Add 'vendor' role if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'vendor' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'vendor';
  END IF;
  
  -- Add 'ngo' role if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ngo' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'ngo';
  END IF;
  
  -- Add 'user' role if it doesn't exist (regular user role)
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'user' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'user';
  END IF;
END $$;