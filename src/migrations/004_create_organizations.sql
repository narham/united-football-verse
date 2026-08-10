-- Migration: Create organizations table
-- Purpose: Store football club/academy organizations (aggregates)
-- PHASE 6 STEP 5.1
-- Date: 2026-08-09
--
-- Business Model:
-- - One organization = one football club/academy (e.g., SSB Garuda Muda)
-- - Organization is the primary isolation unit for multi-tenancy
-- - All other entities (players, teams, matches, etc.) are scoped to organization
-- - Each organization has own seasons, teams, matches, finance records

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Information
  name TEXT NOT NULL,                     -- e.g., "SSB Garuda Muda"
  short TEXT,                             -- e.g., "GRD"
  city TEXT,                              -- e.g., "Bandung"
  founded_year INT,                       -- e.g., 2012
  
  -- Current Season (FK to seasons table, optional)
  current_season_id UUID,                 -- Will be set after seasons table exists
  
  -- Multi-Tenancy: Organization ID for RLS
  organization_id UUID NOT NULL DEFAULT gen_random_uuid(),
  
  -- Branding
  logo_url TEXT,                          -- Club logo URL
  
  -- Status
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT name_not_empty CHECK (LENGTH(name) > 0),
  CONSTRAINT organization_id_not_null CHECK (organization_id IS NOT NULL)
);

-- Indexes for common queries
CREATE INDEX idx_organizations_status ON public.organizations (status);
CREATE INDEX idx_organizations_created_at ON public.organizations (created_at);
CREATE INDEX idx_organizations_name ON public.organizations USING GIN (to_tsvector('english', name));

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for organizations
-- ============================================================================

-- Policy: Users can see organizations they're members of
CREATE POLICY "Users can view organizations they're members of" ON public.organizations
  FOR SELECT
  USING (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND status = 'ACTIVE'
    )
  );

-- Policy: Organization owners can update their organization
CREATE POLICY "Org owners can update organization" ON public.organizations
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN')
      AND status = 'ACTIVE'
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN')
      AND status = 'ACTIVE'
    )
  );

-- Policy: Only service role can insert organizations
CREATE POLICY "Service role can create organizations" ON public.organizations
  FOR INSERT
  WITH CHECK (TRUE);

-- Policy: Only org owners can delete (soft delete)
CREATE POLICY "Org owners can delete organization" ON public.organizations
  FOR DELETE
  USING (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role = 'ORG_OWNER'
      AND status = 'ACTIVE'
    )
  );

-- ============================================================================
-- Permissions
-- ============================================================================

GRANT SELECT ON public.organizations TO authenticated;
GRANT UPDATE ON public.organizations TO authenticated;
GRANT ALL PRIVILEGES ON public.organizations TO service_role;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.organizations IS 'Football clubs/academies (aggregates) in multi-tenant system';
COMMENT ON COLUMN public.organizations.organization_id IS 'Multi-tenancy isolation key (points to self)';
COMMENT ON COLUMN public.organizations.current_season_id IS 'Reference to currently active season';
COMMENT ON COLUMN public.organizations.status IS 'Organization lifecycle status';
COMMENT ON POLICY "Users can view organizations they're members of" ON public.organizations
  IS 'Members can see their organizations only';
COMMENT ON POLICY "Org owners can update organization" ON public.organizations
  IS 'Only organization owners/admins can edit organization details';
