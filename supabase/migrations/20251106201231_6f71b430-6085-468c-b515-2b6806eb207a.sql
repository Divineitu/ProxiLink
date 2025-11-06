-- Drop all policies that depend on has_role function
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all services" ON services;
DROP POLICY IF EXISTS "Admins can view all events" ON events;

-- Drop the function
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Rename and replace the enum
ALTER TYPE app_role RENAME TO app_role_old;
CREATE TYPE app_role AS ENUM ('user', 'vendor', 'ngo', 'admin');

-- Update the user_roles table to use the new enum
ALTER TABLE user_roles 
  ALTER COLUMN role TYPE app_role 
  USING (
    CASE role::text
      WHEN 'youth' THEN 'user'::app_role
      ELSE role::text::app_role
    END
  );

-- Drop the old type
DROP TYPE app_role_old;

-- Recreate the has_role function with the new enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Recreate the policies
CREATE POLICY "Admins can view all roles" 
ON user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" 
ON user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all services" 
ON services 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all events" 
ON events 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));