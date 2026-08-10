-- Migration: Create organization_memberships table
-- Purpose: Link users to organizations with roles and permissions
-- Created: STEP 4.15
--
-- This table implements the multi-organization membership model.
-- Each user can have multiple memberships to different organizations.
-- Each membership grants a specific role (ORG_OWNER, ORG_ADMIN, MANAGER, COACH, STAFF, FINANCE, VIEWER, PLATFORM_ADMIN).

CREATE TABLE IF NOT EXISTS public.organization_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to user profile
  user_id UUID NOT NULL REFERENCES public.user_profiles (id) ON DELETE CASCADE,
  
  -- Organization ID (references a yet-to-be-defined organizations table)
  -- For now, this is a UUID that references organizations
  organization_id UUID NOT NULL,
  
  -- Role in this organization (PLATFORM_ADMIN, ORG_OWNER, ORG_ADMIN, MANAGER, COACH, STAFF, FINANCE, VIEWER)
  role TEXT NOT NULL CHECK (
    role IN ('PLATFORM_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'COACH', 'STAFF', 'FINANCE', 'VIEWER')
  ),
  
  -- Membership Status (ACTIVE, INVITED, SUSPENDED, REVOKED)
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (
    status IN ('ACTIVE', 'INVITED', 'SUSPENDED', 'REVOKED')
  ),
  
  -- Timestamps
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  -- Unique constraint: each user can only have one active membership per organization
  CONSTRAINT unique_user_org_membership UNIQUE (user_id, organization_id),
  CONSTRAINT valid_role CHECK (role != ''),
  CONSTRAINT valid_status CHECK (status != '')
);

-- Create index on user_id for quick lookups
CREATE INDEX idx_organization_memberships_user_id ON public.organization_memberships (user_id);

-- Create index on organization_id for lookups
CREATE INDEX idx_organization_memberships_organization_id ON public.organization_memberships (organization_id);

-- Create index on status for filtering active members
CREATE INDEX idx_organization_memberships_status ON public.organization_memberships (status);

-- Create index on user_id + organization_id for quick membership checks
CREATE INDEX idx_organization_memberships_user_org ON public.organization_memberships (user_id, organization_id);

-- Enable RLS on organization_memberships
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;

-- Comment on table
COMMENT ON TABLE public.organization_memberships IS 'Links users to organizations with roles and membership status';
COMMENT ON COLUMN public.organization_memberships.user_id IS 'Foreign key to user_profiles for the member';
COMMENT ON COLUMN public.organization_memberships.organization_id IS 'Organization identifier (references organizations table)';
COMMENT ON COLUMN public.organization_memberships.role IS 'User role in this organization: PLATFORM_ADMIN, ORG_OWNER, ORG_ADMIN, MANAGER, COACH, STAFF, FINANCE, VIEWER';
COMMENT ON COLUMN public.organization_memberships.status IS 'Membership status: ACTIVE, INVITED, SUSPENDED, REVOKED';
COMMENT ON COLUMN public.organization_memberships.joined_at IS 'When user joined the organization';
