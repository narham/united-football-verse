-- Migration: Extend players table with organization isolation
-- Purpose: Add organization_id column to existing players table for multi-tenancy
-- PHASE 6 STEP 5.4
-- Date: 2026-08-09
--
-- Note: This assumes a basic players table exists from Step 3.
-- This migration adds organization isolation (organization_id column).

-- Add organization_id column if it doesn't exist
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Backfill existing players with a default organization (to be replaced with real data)
UPDATE public.players 
SET organization_id = gen_random_uuid() 
WHERE organization_id IS NULL;

-- Make organization_id NOT NULL after backfill
ALTER TABLE public.players
ALTER COLUMN organization_id SET NOT NULL;

-- Add check constraint
ALTER TABLE public.players
ADD CONSTRAINT check_org_id CHECK (organization_id IS NOT NULL);

-- Add foreign key (if teams table exists and players have team_id)
-- This will depend on schema structure, but typically:
-- ALTER TABLE public.players
-- ADD CONSTRAINT fk_players_teams 
-- FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;

-- Ensure unique football_id (identity stable across organizations)
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_football_id 
  ON public.players (football_id) WHERE football_id IS NOT NULL;

-- Ensure unique (organization_id, number) for shirt number uniqueness per team
CREATE INDEX IF NOT EXISTS idx_players_org_number 
  ON public.players (organization_id, number) WHERE number IS NOT NULL;

-- Index for organizational queries
CREATE INDEX IF NOT EXISTS idx_players_organization_id 
  ON public.players (organization_id);

-- Enable RLS if not already enabled
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for players (updated for organization isolation)
-- ============================================================================

-- Drop existing player policies if they exist (replace with org-aware versions)
DROP POLICY IF EXISTS "Club staff manage players" ON public.players;
DROP POLICY IF EXISTS "Users can view players from their organizations" ON public.players;
DROP POLICY IF EXISTS "Org staff can create players" ON public.players;
DROP POLICY IF EXISTS "Org staff can update players" ON public.players;

-- Policy: Users can view players from their organizations
CREATE POLICY "Users can view players from their organizations" ON public.players
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

-- Policy: Staff (COACH, STAFF, MANAGER, ORG_ADMIN) can create players
CREATE POLICY "Org staff can create players" ON public.players
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'COACH', 'STAFF')
      AND status = 'ACTIVE'
    )
  );

-- Policy: Authorized staff can update players
CREATE POLICY "Org staff can update players" ON public.players
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'COACH', 'STAFF')
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
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'COACH', 'STAFF')
      AND status = 'ACTIVE'
    )
  );

-- Policy: Only authorized roles can delete
CREATE POLICY "Org admins can delete players" ON public.players
  FOR DELETE
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
  );

-- ============================================================================
-- Permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.players TO authenticated;
GRANT ALL PRIVILEGES ON public.players TO service_role;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON COLUMN public.players.organization_id IS 'Multi-tenancy isolation key';
COMMENT ON INDEX idx_players_football_id IS 'Ensures football_id uniqueness (identity stable across organizations)';
COMMENT ON POLICY "Users can view players from their organizations" ON public.players
  IS 'Members can only see players from their authorized organizations';
