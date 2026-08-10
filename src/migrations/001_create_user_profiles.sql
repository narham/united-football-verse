-- Migration: Create user_profiles table
-- Purpose: Store user profile information linked to Supabase Auth
-- Created: STEP 4.15
-- 
-- This table extends Supabase Auth with additional profile data.
-- Each user has exactly one profile linked via auth_user_id.

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to Supabase Auth
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  
  -- Profile Information
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  
  -- Status (ACTIVE, SUSPENDED, DELETED)
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DELETED')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT email_not_empty CHECK (LENGTH(email) > 0),
  CONSTRAINT display_name_not_empty CHECK (LENGTH(display_name) > 0)
);

-- Create index on auth_user_id for quick lookups
CREATE INDEX idx_user_profiles_auth_user_id ON public.user_profiles (auth_user_id);

-- Create index on email for lookups
CREATE INDEX idx_user_profiles_email ON public.user_profiles (email);

-- Create index on status for filtering active users
CREATE INDEX idx_user_profiles_status ON public.user_profiles (status);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Comment on table
COMMENT ON TABLE public.user_profiles IS 'User profile information with links to Supabase Auth users';
COMMENT ON COLUMN public.user_profiles.auth_user_id IS 'Foreign key to auth.users for linking to authenticated user';
COMMENT ON COLUMN public.user_profiles.status IS 'User account status: ACTIVE, SUSPENDED, or DELETED';
