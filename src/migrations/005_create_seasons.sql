-- Migration: Create seasons table
-- Purpose: Store football seasons (business rule: only 1 ACTIVE per organization)
-- PHASE 6 STEP 5.2
-- Date: 2026-08-09
--
-- Business Rules:
-- - Only ONE season can have status='ACTIVE' per organization at any time
-- - DRAFT seasons can be configured before activation
-- - ARCHIVED seasons are read-only historical records
-- - Season is the root entity for teams, matches, training schedules

CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-Tenancy (RLS isolation key)
  organization_id UUID NOT NULL,
  
  -- Season Information
  name TEXT NOT NULL,                     -- e.g., "2026/2027", "Musim 2026"
  start_date DATE NOT NULL,               -- Season start date
  end_date DATE NOT NULL,                 -- Season end date
  
  -- Status (business rule: only 1 ACTIVE per org)
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT name_not_empty CHECK (LENGTH(name) > 0),
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  CONSTRAINT organization_id_not_null CHECK (organization_id IS NOT NULL)
);

-- Business rule enforcement: Only 1 ACTIVE season per organization
CREATE UNIQUE INDEX idx_seasons_active_per_org 
  ON public.seasons (organization_id) 
  WHERE status = 'ACTIVE';

-- Indexes for common queries
CREATE INDEX idx_seasons_organization_id ON public.seasons (organization_id);
CREATE INDEX idx_seasons_status ON public.seasons (status);
CREATE INDEX idx_seasons_start_date ON public.seasons (start_date);

-- Enable RLS
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for seasons
-- ============================================================================

-- Policy: Users can see seasons from their organizations
CREATE POLICY "Users can view seasons from their organizations" ON public.seasons
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

-- Policy: Managers and admins can create seasons
CREATE POLICY "Org admins can create seasons" ON public.seasons
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

-- Policy: Admins can update seasons
CREATE POLICY "Org admins can update seasons" ON public.seasons
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

-- Policy: Only service role can delete
CREATE POLICY "Service role can delete seasons" ON public.seasons
  FOR DELETE
  USING (TRUE);

-- ============================================================================
-- Permissions
-- ============================================================================

GRANT SELECT ON public.seasons TO authenticated;
GRANT INSERT, UPDATE ON public.seasons TO authenticated;
GRANT ALL PRIVILEGES ON public.seasons TO service_role;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.seasons IS 'Football seasons per organization (business rule: 1 ACTIVE per org)';
COMMENT ON COLUMN public.seasons.organization_id IS 'Multi-tenancy isolation key';
COMMENT ON COLUMN public.seasons.status IS 'Season lifecycle: DRAFT (configuring), ACTIVE (current), ARCHIVED (completed)';
COMMENT ON INDEX idx_seasons_active_per_org IS 'Enforces business rule: only 1 ACTIVE season per organization';
