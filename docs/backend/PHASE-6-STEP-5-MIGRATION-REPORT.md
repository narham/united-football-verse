# Database Migrations — PHASE 6 STEP 5

**Date:** 2026-08-09  
**Phase:** PHASE 6 (Backend Real Persistence)  
**Step:** STEP 5 (Core Business Domains)  
**Status:** COMPLETE

---

## Migration Overview

All migrations implement multi-tenant organization isolation via RLS policies. Every table has:
- `organization_id` column for isolation key
- RLS policies enforcing access to user's organizations only
- RBAC integration (roles determine write permissions)

### Migration Sequence

Execute migrations in order (001 → 011) to maintain referential integrity:

#### ✅ 001 — Create user_profiles (STEP 4)
- Extended Supabase Auth with profile data
- Unique email, links to auth_user_id
- RLS: Users see own profile only

#### ✅ 002 — Create organization_memberships (STEP 4)
- Maps users to organizations with roles
- Business rule: 1 active membership per (user, org) pair
- RLS: Users see memberships; admins see all members

#### ✅ 003 — Add RLS policies (STEP 4)
- Enforces security at database level
- Drop-in policies for user_profiles and organization_memberships

---

#### 🚀 004 — Create organizations
**File:** `004_create_organizations.sql`
- **Table:** `organizations`
- **Columns:**
  - `id` (UUID, PK)
  - `organization_id` (UUID, isolation key)
  - `name` (TEXT) — Club name
  - `short` (TEXT) — Abbreviation
  - `city` (TEXT) — Location
  - `founded_year` (INT)
  - `current_season_id` (UUID, FK) — Active season
  - `logo_url` (TEXT)
  - `status` (ENUM: ACTIVE, INACTIVE, ARCHIVED)
  - `created_at`, `updated_at` (TIMESTAMPTZ)
- **Indexes:** status, name (GIN), created_at
- **RLS:** Users see orgs they're members of; admins can update
- **Business Rule:** Primary isolation unit for multi-tenancy

#### 🚀 005 — Create seasons
**File:** `005_create_seasons.sql`
- **Table:** `seasons`
- **Columns:**
  - `id`, `organization_id` (FK)
  - `name` (TEXT) — e.g., "2026/2027"
  - `start_date`, `end_date` (DATE)
  - `status` (ENUM: DRAFT, ACTIVE, ARCHIVED)
  - `created_at`, `updated_at`
- **Indexes:** organization_id, status, start_date
- **Unique Constraint:** Only 1 ACTIVE season per org (business rule)
- **RLS:** Members see season; admins/managers can manage
- **Business Rule:** Seasons group teams, matches, training

#### 🚀 006 — Create teams
**File:** `006_create_teams.sql`
- **Table:** `teams`
- **Columns:**
  - `id`, `organization_id` (FK)
  - `season_id` (FK) → seasons
  - `name` (TEXT) — e.g., "U-19 Team"
  - `category` (TEXT) — e.g., "U-19", "Senior"
  - `status` (ENUM)
- **Indexes:** organization_id, season_id, status
- **RLS:** Members see teams; coaches can manage
- **Business Rule:** Teams group players within a season

#### 🚀 007 — Players add organization isolation
**File:** `007_players_add_org_isolation.sql`
- **Action:** Adds `organization_id` column to existing `players` table (from STEP 3)
- **Migration Pattern:** Backfills column with default UUIDs (to be replaced by real data)
- **New Indexes:** football_id (unique), organization_id, org_number
- **Updated RLS:** Org-aware access control for players
- **Identity Stability:** football_id remains UNIQUE (stable across organizations)

#### 🚀 008 — Create staff
**File:** `008_create_staff.sql`
- **Table:** `staff`
- **Columns:**
  - `id`, `organization_id` (FK)
  - `name`, `role` (ENUM: HEAD_COACH, ASSISTANT_COACH, GK_COACH, PHYSIO, MANAGER, OPERATOR)
  - `telephone`, `email`
  - `status` (ENUM)
- **RLS:** Members see staff; admins/managers can manage
- **Business Rule:** Track coaching and administrative personnel

#### 🚀 009 — Create training and attendance
**File:** `009_create_training_and_attendance.sql`
- **Tables:**
  - `training_sessions`: Recurring training schedule
    - `id`, `organization_id`
    - `team_id` (FK)
    - `title`, `day_of_week`, `start_time`, `end_time`, `location`, `focus`
    - `status`
  - `attendance`: Player attendance per training date
    - `id`, `organization_id`
    - `training_id`, `player_id` (FKs)
    - `status` (ENUM: PRESENT, ABSENT_SICK, ABSENT_PERMISSION, ABSENT_UNEXCUSED, LATE)
    - `date` (YYYY-MM-DD)
- **Constraints:** `UNIQUE(training_id, player_id, date)` on attendance
- **RLS:** Members see; coaches can record; admins can delete
- **Business Rule:** Track recurring sessions and actual attendance

#### 🚀 010 — Create competitions and matches
**File:** `010_create_competitions_and_matches.sql`
- **Tables:**
  - `competitions`: Tournaments/leagues
    - `id`, `organization_id`
    - `season_id` (FK)
    - `name`, `level`
    - `status` (ENUM: DRAFT, ACTIVE, COMPLETED, ARCHIVED)
  - `matches`: Individual matches
    - `id`, `organization_id`
    - `team_id`, `competition_id` (FKs)
    - `opponent_name`, `match_date`
    - `score_home`, `score_away` (nullable until played)
    - `venue` (ENUM: HOME, AWAY, NEUTRAL)
    - `status` (ENUM: SCHEDULED, COMPLETED, CANCELLED, ARCHIVED)
- **Indexes:** organization_id, team_id, competition_id, date, status
- **RLS:** Members see; managers can manage; admins can delete
- **Business Rule:** Organize matches within competitions

#### 🚀 011 — Create transactions (Finance)
**File:** `011_create_transactions.sql`
- **Table:** `transactions`
- **Columns:**
  - `id`, `organization_id`
  - `date` (DATE)
  - `type` (ENUM: INCOME, EXPENSE)
  - `amount` (INT, positive value only; sign applied by type)
  - `category` (ENUM: SPP, REGISTRATION, EQUIPMENT, OPERATIONAL, TOURNAMENT, OTHER)
  - `description` (TEXT)
  - `status` (ENUM: RECORDED, VERIFIED, ARCHIVED)
- **Indexes:** organization_id, date, type, category
- **Composite Indexes:** org_date, org_category
- **Helper Function:** `get_organization_balance(UUID)` → current balance
- **RLS:** Members see; finance/managers can record; admins can delete
- **Business Rule:** Track income/expenses per organization

---

## RLS Policy Pattern (All Tables)

Every table follows this pattern:

```sql
-- SELECT: User's organizations only
CREATE POLICY "Users can view <entity> from their organizations" ON public.<table>
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

-- INSERT: Authorized roles only
CREATE POLICY "<Role> can create <entity>" ON public.<table>
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', ...)
      AND status = 'ACTIVE'
    )
  );

-- UPDATE: Authorized roles only (same check)
CREATE POLICY "<Role> can update <entity>" ON public.<table>
  FOR UPDATE
  USING (...)
  WITH CHECK (...);

-- DELETE: Admin roles only
CREATE POLICY "Admins can delete <entity>" ON public.<table>
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
```

---

## Multi-Tenancy Enforcement

### Defense in Depth

1. **Database Level (RLS)**: Policies enforce isolation
   - Cross-org queries blocked by RLS
   - Database guarantees no accidental leakage
   - Auditable at SQL level

2. **Application Level (RBAC)**: Roles control write access
   - 8 roles with 23 unique permissions
   - VIEWER can read only
   - COACH/STAFF can manage players/training
   - MANAGER/ADMIN can manage org-wide data
   - ORG_OWNER has full control

3. **Repository Pattern**: Enforces isolation semantically
   - Every repository method checks organization_id
   - No raw SQL queries allowed
   - Type safety prevents accidental leakage

### Safeguarding Rules (§19)

- **Identity Documents:** NIK/Passport/KITAS masked except for verified admins
- **Guardian Consent:** Required for minors (implementation in future)
- **Audit Trail:** All sensitive operations logged

---

## Migration Execution

### Prerequisites
- Supabase project created
- Environment variables set:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Service role key available for migrations

### Steps
1. Connect to Supabase with service role
2. Run migrations in sequence (001 → 011)
3. Verify RLS policies enabled on all tables
4. Seed demo data (optional, or via API)

### Verification Checklist
- [ ] All tables created
- [ ] All RLS policies enabled
- [ ] All indexes created
- [ ] All foreign keys enforced
- [ ] Organization isolation working (test cross-org access blocked)
- [ ] RBAC enforced (test unauthorized role denied)

---

## Data Structure Mapping

| App Entity | Database Table | Organization Scope | Notes |
|---|---|---|---|
| Organization | organizations | Self | Primary isolation unit |
| Season | seasons | organization_id | Business rule: 1 ACTIVE per org |
| Team | teams | organization_id | Linked to season |
| Player | players | organization_id | football_id stable across orgs |
| Staff | staff | organization_id | Roles: coach, manager, physio, etc. |
| TrainingSession | training_sessions | organization_id | Recurring schedule |
| Attendance | attendance | organization_id | Per-date records |
| Competition | competitions | organization_id | Tournaments/leagues |
| Match | matches | organization_id | Within competition |
| Transaction | transactions | organization_id | Income/expense |

---

## Indexes for Performance

### Mandatory Indexes (Query Filtering)
- All tables: `idx_<table>_organization_id` (for WHERE organization_id = X)
- All tables: `idx_<table>_status` (for status filtering)
- All tables: `idx_<table>_created_at` (for sorting)

### Unique Constraints (Business Rules)
- `organizations.id` (PK)
- `seasons` (organization_id, status) UNIQUE WHERE status='ACTIVE' (1 per org)
- `players.football_id` UNIQUE (identity stable)

### Composite Indexes (Common Queries)
- `transactions (organization_id, date)` (date range reports)
- `transactions (organization_id, category)` (category reports)
- `matches (team_id, competition_id)` (find competition matches)

---

## Future Enhancements

1. **Audit Trail:** Log all mutations for compliance
2. **Soft Deletes:** Implement unified soft-delete pattern
3. **Search:** Full-text search on player names, staff names
4. **Notifications:** Trigger notifications on key events
5. **Webhooks:** Notify external systems of changes
6. **Geo-indexing:** For geo-spatial queries (location-based matches)

---

## Migration Rollback

If issues occur:

```sql
-- Rollback specific migration (example: season)
DROP TABLE IF EXISTS public.seasons CASCADE;
DROP INDEX IF EXISTS idx_seasons_organization_id;
DROP INDEX IF EXISTS idx_seasons_active_per_org;

-- Verify only necessary tables remain
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

---

**Next Steps:**
- Apply migrations to Supabase project
- Run test suite (src/__tests__/backend-step-5-integration.test.js)
- Verify cross-org isolation (P0 CRITICAL test)
- Deploy to production

**Documentation Files:**
- docs/backend/PHASE-6-STEP-5-IMPLEMENTATION-PLAN.md (this plan)
- docs/backend/PHASE-6-STEP-5-MIGRATION-REPORT.md (this file)
- docs/backend/PHASE-6-STEP-5-RLS-REPORT.md (security policies)
- docs/backend/PHASE-6-STEP-5-TEST-REPORT.md (test results)
- docs/backend/PHASE-6-STEP-5-COMPLETION-SUMMARY.md (final summary)
