-- ========================================
-- PROXILINK DATABASE SETUP
-- Run this in your Supabase SQL Editor
-- ========================================

-- Step 1: Check what tables exist and their structure
-- First, let's see what we have
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'user_roles', 'vendor_profiles');

-- Step 2: Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS vendor_profiles CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TYPE IF EXISTS app_role CASCADE;

-- Step 3: Create the app_role enum
CREATE TYPE app_role AS ENUM ('user', 'vendor', 'ngo', 'admin');

-- Step 4: Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create user_roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Step 6: Create vendor_profiles table
CREATE TABLE vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  verification_status BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 7: Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Step 9: Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
  ON user_roles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role on signup" 
  ON user_roles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Step 10: Create RLS policies for vendor_profiles
CREATE POLICY "Vendors can view their own profile" 
  ON vendor_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view verified vendors" 
  ON vendor_profiles FOR SELECT 
  USING (verification_status = true);

CREATE POLICY "Vendors can insert their own profile" 
  ON vendor_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own profile" 
  ON vendor_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Step 11: Fix any existing users (create profiles and roles for them)
INSERT INTO profiles (id, full_name, phone)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
  COALESCE(u.raw_user_meta_data->>'phone', '')
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT 
  u.id,
  'user'::app_role
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 12: Make YOUR email an admin
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'divineokonitu01@gmail.com'  -- ⚠️ CHANGE THIS TO YOUR EMAIL!
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 13: Verify setup
SELECT 
  u.email,
  p.full_name,
  ur.role,
  u.email_confirmed_at IS NOT NULL as email_verified
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;

-- ========================================
-- DONE! You should see all users with profiles and roles
-- ========================================
