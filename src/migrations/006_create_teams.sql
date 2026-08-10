-- Migration: Create teams table
-- Purpose: Store teams within a season (e.g., U-19 team, First Team)
-- PHASE 6 STEP 5.3
-- Date: 2026-08-09
--
-- Business Model:
-- - One season can have multiple teams (U-19, U-17, First Team)
-- - Teams group players and organize matches
-- - Team is scoped to organization and season

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-Tenancy (RLS isolation key)
  organization_id UUID NOT NULL,
  
  -- Foreign Keys
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  
  -- Team Information
  name TEXT NOT NULL,                     -- e.g., "U-19 Team", "First Team"
  category TEXT,                          -- e.g., "U-19", "U-17", "Senior"
  
  -- Status
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT name_not_empty CHECK (LENGTH(name) > 0)
);

-- Indexes
CREATE INDEX idx_teams_organization_id ON public.teams (organization_id);
CREATE INDEX idx_teams_season_id ON public.teams (season_id);
CREATE INDEX idx_teams_status ON public.teams (status);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for teams
-- ============================================================================

CREATE POLICY "Users can view teams from their organizations" ON public.teams
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

CREATE POLICY "Org admins can create teams" ON public.teams
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER')
      AND status = 'ACTIVE'
    )
  );

CREATE POLICY "Org admins can update teams" ON public.teams
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER')
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
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER')
      AND status = 'ACTIVE'
    )
  );

CREATE POLICY "Service role can delete teams" ON public.teams
  FOR DELETE
  USING (TRUE);

-- ============================================================================
-- Permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.teams TO authenticated;
GRANT ALL PRIVILEGES ON public.teams TO service_role;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.teams IS 'Teams within a season (e.g., U-19 team, First Team)';
COMMENT ON COLUMN public.teams.organization_id IS 'Multi-tenancy isolation key';
COMMENT ON COLUMN public.teams.season_id IS 'Season this team belongs to';
COMMENT ON COLUMN public.teams.category IS 'Team category (age group or team level)';
