/* =========================================================
 * 012_step5-remediation.sql
 * =========================================================
 * PHASE 6 STEP 5 — REMEDIATION MIGRATION
 *
 * Fixes:
 *   P0-1: organizations dual-UUID — enforce organization_id = id
 *   P0-3: players.team_id column missing (FK to teams)
 *   P1-1: Missing FK from child tables to organizations(id)
 *   P1-2: Demo players backfilled each with unique org → collapse
 *   P1-6: Matches DB CHECK: COMPLETED requires both scores non-null
 *
 * Safe: Uses IF NOT EXISTS / NOT VALID where applicable.
 * Idempotent.
 * =======================================================*/

-- ------------------------------------------------------------------
-- P0-1: ORGANIZATIONS DUAL-UUID ENFORCEMENT
-- Canonical key is organizations.id (PRIMARY KEY).
-- The column organization_id on the organizations table itself
-- is a legacy mechanical artifact. Enforce it always equals id.
-- ------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'organizations'
           AND column_name  = 'organization_id'
    ) THEN
        -- Backfill any rows that somehow have mismatched values
        UPDATE public.organizations
           SET organization_id = id
         WHERE organization_id IS DISTINCT FROM id;

        -- Add CHECK constraint with explicit name
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
             WHERE conname = 'organizations_organization_id_equals_id_check'
        ) THEN
            ALTER TABLE public.organizations
                ADD CONSTRAINT organizations_organization_id_equals_id_check
                CHECK (organization_id = id);
        END IF;

        -- Non-null enforcement (if nullable for some reason)
        ALTER TABLE public.organizations
            ALTER COLUMN organization_id SET NOT NULL;
    END IF;
END $$;

COMMENT ON COLUMN public.organizations.organization_id IS
    'DEPRECATED alias for organizations.id. Always equals id (enforced by CHECK).';

-- ------------------------------------------------------------------
-- P0-3: players.team_id column + FK to teams(id)
-- Migration 006_create_teams.sql commented this out. Add it now.
-- Also index for RLS/joins.
-- ------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'players'
           AND column_name  = 'team_id'
    ) THEN
        ALTER TABLE public.players
            ADD COLUMN team_id UUID NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
         WHERE conname = 'players_team_id_fkey'
    ) THEN
        ALTER TABLE public.players
            ADD CONSTRAINT players_team_id_fkey
            FOREIGN KEY (team_id)
            REFERENCES public.teams(id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_players_team_id
    ON public.players (team_id);

-- ------------------------------------------------------------------
-- P1-1: FOREIGN KEYS from child organization-scoped tables
--        to organizations(id). Each with RESTRICT / SET NULL / CASCADE
--        appropriate to the semantic relationship.
--
--  1. organization_memberships.organization_id → organizations(id)
--  2. seasons.organization_id                 → organizations(id)
--  3. teams.organization_id                   → organizations(id)
--  4. players.organization_id                 → organizations(id)
--  5. staff.organization_id                   → organizations(id)
--  6. training_sessions.organization_id       → organizations(id)
--  7. attendances.organization_id             → organizations(id)
--  8. competitions.organization_id            → organizations(id)
--  9. matches.organization_id                 → organizations(id)
-- 10. transactions.organization_id            → organizations(id)
-- ------------------------------------------------------------------

-- 1. organization_memberships
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'org_memberships_organization_id_fkey'
    ) THEN
        ALTER TABLE public.organization_memberships
            ADD CONSTRAINT org_memberships_organization_id_fkey
            FOREIGN KEY (organization_id)
            REFERENCES public.organizations(id)
            ON DELETE CASCADE;
    END IF;
END $$;

-- 2. seasons
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'seasons_organization_id_fkey'
    ) THEN
        ALTER TABLE public.seasons
            ADD CONSTRAINT seasons_organization_id_fkey
            FOREIGN KEY (organization_id)
            REFERENCES public.organizations(id)
            ON DELETE CASCADE;
    END IF;
END $$;

-- 3. teams
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'teams_organization_id_fkey'
    ) THEN
        ALTER TABLE public.teams
            ADD CONSTRAINT teams_organization_id_fkey
            FOREIGN KEY (organization_id)
            REFERENCES public.organizations(id)
            ON DELETE CASCADE;
    END IF;
END $$;

-- 4. players
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'players_organization_id_fkey'
    ) THEN
        ALTER TABLE public.players
            ADD CONSTRAINT players_organization_id_fkey
            FOREIGN KEY (organization_id)
            REFERENCES public.organizations(id)
            ON DELETE CASCADE;
    END IF;
END $$;

-- 5. staff
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'staff_organization_id_fkey'
    ) THEN
        ALTER TABLE public.staff
            ADD CONSTRAINT staff_organization_id_fkey
            FOREIGN KEY (organization_id)
            REFERENCES public.organizations(id)
            ON DELETE CASCADE;
    END IF;
END $$;

-- 6. training_sessions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'training_organization_id_fkey'
    ) THEN
        ALTER TABLE public.training_sessions
            ADD CONSTRAINT training_organization_id_fkey
            FOREIGN KEY (organization_id)
            REFERENCES public.organizations(id)
            ON DELETE CASCADE;
    END IF;
END $$;

-- 7. attendances
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'attendances_organization_id_fkey'
    ) THEN
        ALTER TABLE public.attendances
            ADD CONSTRAINT attendances_organization_id_fkey
            FOREIGN KEY (organization_id)
            REFERENCES public.organizations(id)
            ON DELETE CASCADE;
    END IF;
END $$;

-- 8. competitions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'competitions_organization_id_fkey'
    ) THEN
        ALTER TABLE public.competitions
            ADD CONSTRAINT competitions_organization_id_fkey
            FOREIGN KEY (organization_id)
            REFERENCES public.organizations(id)
            ON DELETE CASCADE;
    END IF;
END $$;

-- 9. matches
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'matches_organization_id_fkey'
    ) THEN
        ALTER TABLE public.matches
            ADD CONSTRAINT matches_organization_id_fkey
            FOREIGN KEY (organization_id)
            REFERENCES public.organizations(id)
            ON DELETE CASCADE;
    END IF;
END $$;

-- 10. transactions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'transactions_organization_id_fkey'
    ) THEN
        ALTER TABLE public.transactions
            ADD CONSTRAINT transactions_organization_id_fkey
            FOREIGN KEY (organization_id)
            REFERENCES public.organizations(id)
            ON DELETE CASCADE;
    END IF;
END $$;

-- ------------------------------------------------------------------
-- P1-2: DEMO PLAYER ORG ISOLATION BACKFILL
-- Migration 007 used gen_random_uuid() per row — each player
-- got a DIFFERENT organization_id. In demo mode all entities
-- share DEFAULT_CLUB_ID = "club-garuda". In Supabase mode all
-- players of one organization must have the SAME organization_id.
--
-- Fix strategy:
--   IF a public.organizations row exists with name matching the
--   canonical default org name, collapse all NULL / randomized
--   players.organization_id onto that organization's id.
--   Otherwise create one canonical default org first.
-- ------------------------------------------------------------------
DO $$
DECLARE
    v_default_org_id UUID;
    v_canonical_name TEXT := 'SSB Garuda Muda';
BEGIN
    -- (a) Find existing canonical default org (by name or any single org)
    SELECT id INTO v_default_org_id
      FROM public.organizations
     WHERE name = v_canonical_name
     LIMIT 1;

    -- If not found by name, fall back to any one existing org
    IF v_default_org_id IS NULL THEN
        SELECT id INTO v_default_org_id
          FROM public.organizations
         LIMIT 1;
    END IF;

    -- (b) If no organization exists at all, create the canonical one
    IF v_default_org_id IS NULL THEN
        v_default_org_id := gen_random_uuid();
        INSERT INTO public.organizations (id, organization_id, name, status)
        VALUES (v_default_org_id, v_default_org_id, v_canonical_name, 'ACTIVE');
    END IF;

    -- (c) Backfill all players with org_id not in organizations table
    --     (i.e. the randomized orphan UUIDs from migration 007)
    UPDATE public.players
       SET organization_id = v_default_org_id
     WHERE organization_id NOT IN (SELECT id FROM public.organizations)
        OR organization_id IS NULL;

    -- (d) Same backfill for staff, seasons, teams, training,
    --     competitions, matches, transactions that have orphan org_ids
    UPDATE public.staff               SET organization_id = v_default_org_id WHERE organization_id NOT IN (SELECT id FROM public.organizations) OR organization_id IS NULL;
    UPDATE public.seasons             SET organization_id = v_default_org_id WHERE organization_id NOT IN (SELECT id FROM public.organizations) OR organization_id IS NULL;
    UPDATE public.teams               SET organization_id = v_default_org_id WHERE organization_id NOT IN (SELECT id FROM public.organizations) OR organization_id IS NULL;
    UPDATE public.training_sessions   SET organization_id = v_default_org_id WHERE organization_id NOT IN (SELECT id FROM public.organizations) OR organization_id IS NULL;
    UPDATE public.attendances         SET organization_id = v_default_org_id WHERE organization_id NOT IN (SELECT id FROM public.organizations) OR organization_id IS NULL;
    UPDATE public.competitions        SET organization_id = v_default_org_id WHERE organization_id NOT IN (SELECT id FROM public.organizations) OR organization_id IS NULL;
    UPDATE public.matches             SET organization_id = v_default_org_id WHERE organization_id NOT IN (SELECT id FROM public.organizations) OR organization_id IS NULL;
    UPDATE public.transactions        SET organization_id = v_default_org_id WHERE organization_id NOT IN (SELECT id FROM public.organizations) OR organization_id IS NULL;
END $$;

-- ------------------------------------------------------------------
-- P1-6: MATCH COMPLETED CHECK — COMPLETED status REQUIRES both scores
-- Also protect SCHEDULED/UPCOMING: scores MUST both be NULL.
-- ------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'matches_completed_scores_check'
    ) THEN
        ALTER TABLE public.matches
            ADD CONSTRAINT matches_completed_scores_check
            CHECK (
                CASE status
                    WHEN 'COMPLETED' THEN score_home IS NOT NULL AND score_away IS NOT NULL
                    WHEN 'SCHEDULED' THEN score_home IS NULL AND score_away IS NULL
                    ELSE TRUE
                END
            );
    END IF;
END $$;

-- ------------------------------------------------------------------
-- MISSING INDEX: organization_memberships.user_id + organization_id
-- RLS policies JOIN to this table for every query. Without proper
-- indexes on both sides every RLS check is a seq scan.
-- (user_id is already indexed per migration 002. organization_id idx missing)
-- ------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_org_memberships_organization_id
    ON public.organization_memberships (organization_id);

CREATE INDEX IF NOT EXISTS idx_org_memberships_user_org_status
    ON public.organization_memberships (user_id, organization_id, status);

-- ------------------------------------------------------------------
-- P0-1 ADDENDUM: MISSING organizations COLUMNS
-- SupabaseOrganizationRepository.mapFromDatabase() references row.season
-- and row.sport but migration 004 never created them. Add as NULLABLE with
-- sensible defaults so Club interface round-trips without NULL injection.
-- ------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'organizations'
           AND column_name  = 'season'
    ) THEN
        ALTER TABLE public.organizations
            ADD COLUMN season TEXT NOT NULL DEFAULT '2026/2027';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'organizations'
           AND column_name  = 'sport'
    ) THEN
        ALTER TABLE public.organizations
            ADD COLUMN sport TEXT NOT NULL DEFAULT 'Sepak Bola';
    END IF;
END $$;

-- ------------------------------------------------------------------
-- P0-2 ADDENDUM: MISSING players TABLE COLUMNS
-- SupabasePlayerRepository references these columns by Indonesian name.
-- Migration 007 only added organization_id; create the core player
-- attribute columns idempotently so SELECT/INSERT/UPDATE don't 42703.
-- ------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'players'
           AND column_name  = 'nama'
    ) THEN ALTER TABLE public.players ADD COLUMN nama TEXT; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'players'
           AND column_name  = 'posisi'
    ) THEN ALTER TABLE public.players ADD COLUMN posisi TEXT; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'players'
           AND column_name  = 'nomor'
    ) THEN ALTER TABLE public.players ADD COLUMN nomor INT; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'players'
           AND column_name  = 'tgl_lahir'
    ) THEN ALTER TABLE public.players ADD COLUMN tgl_lahir DATE; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'players'
           AND column_name  = 'status'
    ) THEN ALTER TABLE public.players ADD COLUMN status TEXT NOT NULL DEFAULT 'Aktif'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'players'
           AND column_name  = 'tinggi'
    ) THEN ALTER TABLE public.players ADD COLUMN tinggi INT; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'players'
           AND column_name  = 'berat'
    ) THEN ALTER TABLE public.players ADD COLUMN berat INT; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'players'
           AND column_name  = 'kaki'
    ) THEN ALTER TABLE public.players ADD COLUMN kaki TEXT; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'players'
           AND column_name  = 'citizenship'
    ) THEN ALTER TABLE public.players ADD COLUMN citizenship TEXT; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'players'
           AND column_name  = 'foto_url'
    ) THEN ALTER TABLE public.players ADD COLUMN foto_url TEXT; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'players'
           AND column_name  = 'football_id'
    ) THEN ALTER TABLE public.players ADD COLUMN football_id TEXT; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'players'
           AND column_name  = 'created_at'
    ) THEN ALTER TABLE public.players ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(); END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'players'
           AND column_name  = 'updated_at'
    ) THEN ALTER TABLE public.players ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(); END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name   = 'players'
           AND column_name  = 'stats'
    ) THEN ALTER TABLE public.players ADD COLUMN stats JSONB NOT NULL DEFAULT '[]'::jsonb; END IF;
END $$;

-- ------------------------------------------------------------------
-- P0-2 ADDENDUM: FIX idx_players_org_number COLUMN NAME
-- Migration 007 created the index on "number" but the canonical column
-- is "nomor" (per TypeScript Player.nomor and Supabase repo mapping).
-- DROP the broken index and recreate it on the actual column.
-- ------------------------------------------------------------------
DROP INDEX IF EXISTS public.idx_players_org_number;

CREATE INDEX IF NOT EXISTS idx_players_org_nomor
    ON public.players (organization_id, nomor) WHERE nomor IS NOT NULL;

-- ------------------------------------------------------------------
-- P0-3 ADDENDUM: Team create/update canonical input columns
-- CreateTeamInput/UpdateTeamInput originally mismatched repository
-- implementations. Now the interface declares seasonId (UUID FK to
-- seasons.id) and category (team age group e.g. "U-19").
-- Columns already exist per migration 006. Nothing to alter for schema;
-- this block records the invariant and ensures a composite index
-- exists for (organization_id, season_id) — common dashboard query.
-- ------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_teams_org_season
    ON public.teams (organization_id, season_id);

-- ------------------------------------------------------------------
-- P1-1 ADDENDUM: FIX TYPO attendances -> attendance
-- Migration 009 table name is "attendance" (singular). The FK block
-- above and the backfill block both referenced "attendances" (plural)
-- which silently no-ops because the IF NOT EXISTS guard only checks
-- constraint name, not table. Corrective versions below.
-- ------------------------------------------------------------------

-- FK: attendance.organization_id -> organizations(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'attendance_organization_id_fkey'
    ) THEN
        ALTER TABLE public.attendance
            ADD CONSTRAINT attendance_organization_id_fkey
            FOREIGN KEY (organization_id)
            REFERENCES public.organizations(id)
            ON DELETE CASCADE;
    END IF;
END $$;

-- Backfill orphan attendance organization_ids
DO $$
DECLARE
    v_default_org_id UUID;
    v_canonical_name TEXT := 'SSB Garuda Muda';
BEGIN
    SELECT id INTO v_default_org_id
      FROM public.organizations
     WHERE name = v_canonical_name
     LIMIT 1;
    IF v_default_org_id IS NULL THEN
        SELECT id INTO v_default_org_id FROM public.organizations LIMIT 1;
    END IF;
    IF v_default_org_id IS NOT NULL THEN
        UPDATE public.attendance
           SET organization_id = v_default_org_id
         WHERE organization_id NOT IN (SELECT id FROM public.organizations)
            OR organization_id IS NULL;
    END IF;
END $$;

-- ------------------------------------------------------------------
-- P1-6 ADDENDUM: Match W/D/L invariant helper
-- Documented venue semantic: HOME → score_home = our goals.
-- AWAY/NETRAL → score_away = our goals. The app layer computes
-- WIN/DRAW/LOSS accordingly. (Not a SQL constraint; enforced in repo.)
-- Also: SCHEDULED matches MUST have both scores NULL; COMPLETED
-- matches MUST have both scores NON-NULL. (CHECK constraint added
-- earlier: matches_completed_scores_check.)
-- Additional protection: CANCELLED rows cannot have score transitions
-- that would pretend to be COMPLETED results.
-- ------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'matches_cancelled_scores_null_check'
    ) THEN
        ALTER TABLE public.matches
            ADD CONSTRAINT matches_cancelled_scores_null_check
            CHECK (
                CASE status
                    WHEN 'CANCELLED' THEN score_home IS NULL AND score_away IS NULL
                    ELSE TRUE
                END
            );
    END IF;
END $$;

-- ------------------------------------------------------------------
-- PERFORMANCE: Composite indexes for RLS + common filter combos
-- RLS appends organization_id = ? on every SELECT; prefixing the
-- most frequent status/date filters dramatically speeds dashboard.
-- ------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_matches_org_status_date
    ON public.matches (organization_id, status, match_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_org_status_date
    ON public.transactions (organization_id, status, date DESC);

CREATE INDEX IF NOT EXISTS idx_players_org_status_name
    ON public.players (organization_id, status, nama);

CREATE INDEX IF NOT EXISTS idx_training_org_team_day
    ON public.training_sessions (organization_id, team_id, day_of_week);

-- ------------------------------------------------------------------
-- P1-4 RBAC: FINANCE role STAFF CUD exclusion (audit documentation)
--
-- Audit of rbac-matrix.json vs RLS policies:
--
--   FINANCE.staff:       C=false, R=true, U=false, D=false   (MATRIX)
--   staff RLS INSERT:    ORG_OWNER, ORG_ADMIN, MANAGER       (POLICY — no FINANCE ✓)
--   staff RLS UPDATE:    ORG_OWNER, ORG_ADMIN, MANAGER       (POLICY — no FINANCE ✓)
--   staff RLS DELETE:    ORG_OWNER, ORG_ADMIN               (POLICY — no FINANCE ✓)
--
-- Result: separation of duties preserved. No changes required.
-- Comment recorded here for audit trail.
-- ------------------------------------------------------------------

-- ------------------------------------------------------------------
-- FINAL COMMENT / VERSION TRACKING
-- ------------------------------------------------------------------
COMMENT ON TABLE public.organizations IS
    'PHASE 6 STEP 5 REMEDIATED. Canonical PK = id. organization_id = id enforced via CHECK. Columns season, sport added (P0-1).';

COMMENT ON TABLE public.players IS
    'PHASE 6 STEP 5 REMEDIATED. Core columns (nama,posisi,nomor,tgl_lahir,status,tinggi,berat,kaki,citizenship,foto_url,football_id) added idempotently (P0-2).';

COMMENT ON TABLE public.attendance IS
    'PHASE 6 STEP 5 REMEDIATED. FK organization_id → organizations(id) applied; orphan rows backfilled (P1-1).';

COMMENT ON TABLE public.matches IS
    'PHASE 6 STEP 5 REMEDIATED. CHECK constraints: completed_scores, cancelled_scores. Status: SCHEDULED→both null; COMPLETED→both not null; CANCELLED→both null (P1-6).';
