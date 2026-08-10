-- Migration: Create competitions and matches tables
-- Purpose: Track competitions/tournaments and match results
-- PHASE 6 STEP 5.8-5.9
-- Date: 2026-08-09
--
-- Business Model:
-- - Competition = tournament/league (e.g., "Liga SSB Jaya 2026")
-- - Match = individual match within a competition
-- - Each match is scoped to organization, team, and competition

CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-Tenancy (RLS isolation key)
  organization_id UUID NOT NULL,
  
  -- Foreign Keys
  season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
  
  -- Competition Information
  name TEXT NOT NULL,                     -- e.g., "Liga SSB Jaya 2026"
  level TEXT,                             -- e.g., "Regional U-19"
  
  -- Status
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT name_not_empty CHECK (LENGTH(name) > 0)
);

-- Indexes
CREATE INDEX idx_competitions_organization_id ON public.competitions (organization_id);
CREATE INDEX idx_competitions_season_id ON public.competitions (season_id);
CREATE INDEX idx_competitions_status ON public.competitions (status);

-- Enable RLS
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Matches Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-Tenancy (RLS isolation key)
  organization_id UUID NOT NULL,
  
  -- Foreign Keys
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE SET NULL,
  
  -- Match Information
  opponent_name TEXT NOT NULL,            -- e.g., "SSB Persada Junior"
  match_date DATE NOT NULL,               -- YYYY-MM-DD
  
  -- Scores (NULL = upcoming/not played)
  score_home INT,                         -- Our score (if home)
  score_away INT,                         -- Opponent score (if away)
  
  -- Venue
  venue TEXT NOT NULL CHECK (venue IN ('HOME', 'AWAY', 'NEUTRAL')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'ARCHIVED')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT opponent_name_not_empty CHECK (LENGTH(opponent_name) > 0),
  CONSTRAINT score_non_negative CHECK (score_home IS NULL OR score_home >= 0),
  CONSTRAINT score_away_non_negative CHECK (score_away IS NULL OR score_away >= 0)
);

-- Indexes
CREATE INDEX idx_matches_organization_id ON public.matches (organization_id);
CREATE INDEX idx_matches_team_id ON public.matches (team_id);
CREATE INDEX idx_matches_competition_id ON public.matches (competition_id);
CREATE INDEX idx_matches_date ON public.matches (match_date);
CREATE INDEX idx_matches_status ON public.matches (status);

-- Enable RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for competitions
-- ============================================================================

CREATE POLICY "Users can view competitions from their organizations" ON public.competitions
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

CREATE POLICY "Managers can create competitions" ON public.competitions
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'COACH')
      AND status = 'ACTIVE'
    )
  );

CREATE POLICY "Managers can update competitions" ON public.competitions
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'COACH')
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
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'COACH')
      AND status = 'ACTIVE'
    )
  );

CREATE POLICY "Admins can delete competitions" ON public.competitions
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
-- RLS Policies for matches
-- ============================================================================

CREATE POLICY "Users can view matches from their organizations" ON public.matches
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

CREATE POLICY "Managers can create matches" ON public.matches
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'COACH')
      AND status = 'ACTIVE'
    )
  );

CREATE POLICY "Managers can update matches" ON public.matches
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'COACH')
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
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'COACH')
      AND status = 'ACTIVE'
    )
  );

CREATE POLICY "Admins can delete matches" ON public.matches
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

GRANT SELECT, INSERT, UPDATE, DELETE ON public.competitions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT ALL PRIVILEGES ON public.competitions TO service_role;
GRANT ALL PRIVILEGES ON public.matches TO service_role;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.competitions IS 'Tournaments/leagues for organizing matches';
COMMENT ON COLUMN public.competitions.organization_id IS 'Multi-tenancy isolation key';
COMMENT ON TABLE public.matches IS 'Individual matches within competitions';
COMMENT ON COLUMN public.matches.organization_id IS 'Multi-tenancy isolation key';
COMMENT ON COLUMN public.matches.score_home IS 'Score of home team (NULL until match completed)';
COMMENT ON COLUMN public.matches.score_away IS 'Score of away team (NULL until match completed)';
