# PHASE 6 STEP 5 — Core Backend Integration Plan

**Date:** 2026-08-09  
**Phase:** PHASE 6 (Backend Real Persistence)  
**Step:** STEP 5 (Core Business Domains)  
**Status:** IMPLEMENTATION IN PROGRESS

---

## Objective

Replace hard-coded demo data with real Supabase persistence for 10 business domains while preserving:
- Existing UI/UX (no component redesigns)
- Existing route structure
- Demo mode fallback (localStorage continues working)
- Organization isolation (RLS + RBAC)
- Repository abstraction layer (no direct Supabase calls from UI)

---

## Domain Implementation Sequence

### PHASE 6 STEP 5.1: Organization
- **Purpose:** Replace hard-coded club list with persistent organization data
- **Database:** Create `organizations` table
- **Contracts:**
  - `OrganizationRepository.getClub(clubId)` → organization details
  - `OrganizationRepository.updateClub(clubId, patch)` → update organization
  - `OrganizationRepository.getClubs()` → list all orgs
- **UI Integration:** Link `<ClubSwitcher>` to persistent data
- **Status:** NOT STARTED

### PHASE 6 STEP 5.2: Season
- **Purpose:** Implement multi-season support (business rule: only 1 ACTIVE per org)
- **Database:** Create `seasons` table (status: DRAFT, ACTIVE, ARCHIVED)
- **Contracts:**
  - `SeasonRepository.list(orgId)` → seasons for org
  - `SeasonRepository.getActive(orgId)` → current season
  - `SeasonRepository.setActive(id)` → activate season
- **UI Integration:** Update `/musim` route to use persistent data
- **Status:** NOT STARTED

### PHASE 6 STEP 5.3: Team
- **Purpose:** Support multiple teams per season (e.g., U-19, U-17)
- **Database:** Create `teams` table (links season + org)
- **Contracts:**
  - `TeamRepository.list(orgId, seasonId)` → teams for season
  - `TeamRepository.create(orgId, input)` → new team
- **Status:** NOT STARTED

### PHASE 6 STEP 5.4: Player
- **Purpose:** Replace demo players with persistent data (SupabasePlayerRepository partial)
- **Database:** Complete `players` table (football_id identity tracking)
- **Contracts:** Already defined in PlayerRepository interface
- **Status:** PARTIALLY COMPLETE (add Supabase queries for org isolation)

### PHASE 6 STEP 5.5: Staff
- **Purpose:** Persist staff members (coaches, physios, etc.)
- **Database:** Create `staff` table (staff_role enum)
- **Contracts:** StaffRepository interface complete
- **Status:** NOT STARTED

### PHASE 6 STEP 5.6: Training
- **Purpose:** Schedule and track training sessions + attendance
- **Database:** Create `training_sessions` + `attendance` tables
- **Contracts:** 
  - `TrainingRepository.recordAttendance(input)` → log attendance
  - `TrainingRepository.getAttendance(trainingId)` → attendance history
- **Status:** NOT STARTED

### PHASE 6 STEP 5.7: Attendance
- **Purpose:** Record player attendance at training sessions
- **Database:** Use `attendance` table (part of Step 5.6)
- **Status:** NOT STARTED (depends on Step 5.6)

### PHASE 6 STEP 5.8: Competition
- **Purpose:** Define competitions/tournaments
- **Database:** Create `competitions` table (season + level)
- **Contracts:** CompetitionRepository interface complete
- **Status:** NOT STARTED

### PHASE 6 STEP 5.9: Match
- **Purpose:** Record match results with opponent, score, venue
- **Database:** Create `matches` table (links competition + team)
- **Contracts:** MatchRepository interface complete
- **Status:** NOT STARTED

### PHASE 6 STEP 5.10: Finance
- **Purpose:** Track income/expenses (SPP, equipment, operational costs)
- **Database:** Create `transactions` table (tx_type + tx_category)
- **Contracts:** FinanceRepository interface complete
- **Status:** NOT STARTED

---

## Database Schema Overview

### New Tables Required

```
organizations
├── id (UUID, PK)
├── name
├── short
├── city
├── founded_year
├── season_id (FK seasons)
└── organization_id (for RLS isolation)

seasons
├── id (UUID, PK)
├── organization_id (FK, RLS)
├── name
├── start_date
├── end_date
├── status (DRAFT | ACTIVE | ARCHIVED)
└── created_at

teams
├── id (UUID, PK)
├── organization_id (FK, RLS)
├── season_id (FK seasons)
├── name
├── category (e.g., "U-19", "First Team")
└── created_at

players
├── id (UUID, PK)
├── organization_id (FK, RLS)
├── team_id (FK teams)
├── football_id (UNIQUE, identity stable across teams)
├── name
├── position (ENUM: GK, DF, MF, FW)
├── number (shirt number)
├── date_of_birth
├── status (ENUM: ACTIVE, RESERVE, INJURED, INACTIVE)
├── height (cm)
├── weight (kg)
├── preferred_foot (LEFT | RIGHT)
└── identity_document_id (FK, safeguarding rule §19)

staff
├── id (UUID, PK)
├── organization_id (FK, RLS)
├── name
├── role (ENUM: HEAD_COACH, ASSISTANT_COACH, GK_COACH, PHYSIO, MANAGER, OPERATOR)
├── telephone
└── created_at

training_sessions
├── id (UUID, PK)
├── organization_id (FK, RLS)
├── team_id (FK teams)
├── title
├── day_of_week
├── start_time
├── end_time
├── location
├── focus
└── created_at

attendance
├── id (UUID, PK)
├── organization_id (FK, RLS)
├── training_id (FK training_sessions)
├── player_id (FK players)
├── status (ENUM: PRESENT, ABSENT_SICK, ABSENT_PERMISSION, ABSENT_UNEXCUSED, LATE)
├── date (YYYY-MM-DD)
└── recorded_at

competitions
├── id (UUID, PK)
├── organization_id (FK, RLS)
├── name
├── season_id (FK seasons)
├── level (e.g., "Regional U-19", "SSB League")
└── created_at

matches
├── id (UUID, PK)
├── organization_id (FK, RLS)
├── team_id (FK teams)
├── competition_id (FK competitions)
├── opponent_name
├── match_date
├── score_home (nullable until match played)
├── score_away (nullable until match played)
├── venue (ENUM: HOME, AWAY, NEUTRAL)
└── created_at

transactions
├── id (UUID, PK)
├── organization_id (FK, RLS)
├── date
├── type (ENUM: INCOME | EXPENSE)
├── amount
├── category (ENUM: SPP, REGISTRATION, EQUIPMENT, OPERATIONAL, TOURNAMENT, OTHER)
├── description
└── created_at
```

### RLS Isolation Pattern

All tables include:
```sql
-- Column for isolation
organization_id UUID NOT NULL DEFAULT current_setting('app.current_org')::uuid

-- RLS Policy (read)
CREATE POLICY read_own_org ON <table>
  FOR SELECT TO authenticated
  USING (organization_id IN (
    SELECT organization_id 
    FROM organization_memberships 
    WHERE user_id = auth.uid() 
    AND status = 'ACTIVE'
  ))

-- RLS Policy (write)
CREATE POLICY write_own_org ON <table>
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (
    SELECT organization_id 
    FROM organization_memberships 
    WHERE user_id = auth.uid() 
    AND role IN ('ORG_OWNER', 'ORG_ADMIN')
    AND status = 'ACTIVE'
  ))

-- RLS Policy (update)
CREATE POLICY update_own_org ON <table>
  FOR UPDATE TO authenticated
  USING (organization_id IN (...))
  WITH CHECK (organization_id IN (...))

-- RLS Policy (delete)
CREATE POLICY delete_own_org ON <table>
  FOR DELETE to authenticated
  USING (organization_id IN (...))
```

### Multi-Tenancy Enforcement

- Every query MUST filter by `organization_id`
- RLS policies enforce isolation at database level
- UI/Repository layer has additional RBAC checks
- Safeguarding rules applied (identity document masking, guardian consent)

---

## Implementation Rules (STRICT)

### Rule 1: Repository Pattern is ONLY Data Access Boundary
- ✅ UI components call repository methods ONLY
- ✅ Repositories decide whether to use demo (localStorage) or Supabase
- ✅ NO direct Supabase calls from components
- ❌ NO bypassing repository layer

### Rule 2: Dual-Mode Mandatory
- ✅ Demo mode must work independently (no Supabase required)
- ✅ Supabase mode must work independently (production)
- ✅ Factory detects `VITE_SUPABASE_URL` and switches automatically
- ✅ Each repository implements both demo + Supabase versions

### Rule 3: Organization Isolation (P0 CRITICAL)
- ✅ RLS policies enforce access at database level
- ✅ RBAC enforces access at application level
- ✅ Cross-org data access is IMPOSSIBLE (database level)
- ✅ Cross-org access attempts must be detected and logged

### Rule 4: Preserve Existing UI/UX
- ✅ NO component redesigns
- ✅ Component contracts MUST NOT change
- ✅ Props/callbacks remain identical
- ✅ Styling/layout remain identical

### Rule 5: TypeScript Strict Mode
- ✅ 0 errors required (no `any`, no untyped)
- ✅ exactOptionalPropertyTypes: true
- ✅ All existing code must maintain compliance
- ✅ All new code must pass `npx tsc --noEmit`

### Rule 6: Identity Document Masking (§19 Safeguarding)
- ✅ NIK/Passport/KITAS must be masked except for verified admins
- ✅ Masking pattern: "XXX-XXX-XX-1234" (show last 4 only)
- ✅ Storage layer applies masking (not component level)
- ✅ Unmasked values available only via IdentityDocumentRepository

### Rule 7: Demo Data Consistency
- ✅ Demo data must match production schema
- ✅ Demo data must be queryable via same repository interface
- ✅ Demo migrations must show schema in localStorage
- ✅ Demo and Supabase must return identical shapes

### Rule 8: RBAC Enforcement
- ✅ 8 roles: PLATFORM_ADMIN, ORG_OWNER, ORG_ADMIN, MANAGER, COACH, STAFF, FINANCE, VIEWER
- ✅ 23 permissions mapped to roles
- ✅ RBAC enforced in addition to RLS (defense in depth)
- ✅ Audit trail for permission checks (optional but recommended)

### Rule 9: Error Handling
- ✅ Organization isolation violations → 403 FORBIDDEN
- ✅ Authentication failures → 401 UNAUTHORIZED
- ✅ Data validation failures → 400 BAD REQUEST
- ✅ All errors logged to ErrorContext for UI display

### Rule 10: Testing Strategy
- ✅ CRUD test suite per domain (20+ scenarios × 10 domains)
- ✅ Demo mode tests (localStorage independent)
- ✅ Supabase mode tests (database dependent)
- ✅ Cross-org isolation test (P0 CRITICAL)
- ✅ RBAC permission test
- ✅ Identity document masking test
- ✅ Mobile UI test
- ✅ Dark mode test

---

## Deliverables Checklist

### Phase 6 Step 5.1 (Organization)
- [ ] Migration: 004_create_organizations.sql
- [ ] Repository: SupabaseOrganizationRepository
- [ ] Factory updated: createSupabaseRepositories()
- [ ] Tests: organization-simple.test.js (15+ scenarios)
- [ ] Docs: PHASE-6-STEP-5-ORGANIZATION.md

### Phase 6 Step 5.2 (Season)
- [ ] Migration: 005_create_seasons.sql
- [ ] RLS policies for seasons
- [ ] Repository: SupabaseSeasonRepository
- [ ] Factory updated
- [ ] Tests: season-simple.test.js
- [ ] Docs updated

### Phase 6 Step 5.3-5.10
- [ ] Remaining migrations
- [ ] Remaining Supabase repositories
- [ ] RLS policies for all tables
- [ ] Factory updates
- [ ] Test suites for each domain
- [ ] Documentation updates

### Final Deliverables
- [ ] docs/backend/PHASE-6-STEP-5-IMPLEMENTATION-PLAN.md (this file, updated)
- [ ] docs/backend/PHASE-6-STEP-5-DATA-CONTRACT.md (data structures)
- [ ] docs/backend/PHASE-6-STEP-5-MIGRATION-REPORT.md (schema + RLS)
- [ ] docs/backend/PHASE-6-STEP-5-TEST-REPORT.md (test results)
- [ ] docs/backend/PHASE-6-STEP-5-COMPLETION-SUMMARY.md
- [ ] Update ARTIFACT-REGISTRY.md

---

## Quality Gate Checklist

All must be ✅ to mark STEP 5 COMPLETE:

### TypeScript & Build
- [ ] `npx tsc --noEmit` = 0 errors
- [ ] `npm run build` = SUCCESS (all modules)
- [ ] No warnings in build output

### Demo Mode
- [ ] All 10 domains queryable via demo repositories
- [ ] localStorage persists data correctly
- [ ] Demo mode works without Supabase

### Supabase Mode
- [ ] All migrations applied successfully
- [ ] All tables created with correct schema
- [ ] All RLS policies enabled
- [ ] Supabase mode works independently

### Organization Isolation (P0 CRITICAL)
- [ ] Test: User A cannot see User B's org data
- [ ] Test: User A cannot write to User B's org
- [ ] Test: RLS blocks cross-org queries
- [ ] Test: RBAC blocks unauthorized actions

### RBAC Permission Enforcement
- [ ] Test: VIEWER cannot create players
- [ ] Test: COACH cannot create organizations
- [ ] Test: MANAGER can update finance
- [ ] Test: ORG_ADMIN can manage staff

### Identity Document Protection
- [ ] Test: NIK/Passport masked for viewers
- [ ] Test: ORG_OWNER can see unmasked
- [ ] Test: Masking pattern correct (XXX-XXX-XX-1234)
- [ ] Test: Storage layer enforces masking

### UI/UX
- [ ] Mobile responsiveness maintained
- [ ] Dark mode working correctly
- [ ] Loading states appear for async operations
- [ ] Error states display properly
- [ ] Empty states visible when no data

### Database Operations
- [ ] Create operations work (all domains)
- [ ] Read operations work (all domains)
- [ ] Update operations work (all domains)
- [ ] Delete operations work (all domains)
- [ ] Pagination works for list endpoints

### API Contracts
- [ ] All repository methods implemented
- [ ] All return types match interface definitions
- [ ] All error scenarios handled
- [ ] All parameters validated

### Documentation
- [ ] Implementation plan complete
- [ ] Data contracts documented
- [ ] Migration scripts documented
- [ ] RLS policies documented
- [ ] Test results documented
- [ ] Completion summary written

---

## Stop Conditions (Report and do NOT implement if)

- [ ] Existing migration conflicts encountered
- [ ] RLS model conflicts with current architecture
- [ ] Repository interfaces incompatible with existing UI
- [ ] Football ID semantics ambiguous
- [ ] Safeguarding rules violated or impossible to implement
- [ ] Organization isolation cannot be guaranteed at RLS level
- [ ] Existing UI contracts must be broken
- [ ] TypeScript strict mode cannot be maintained

---

## Next Steps (Immediate)

1. ✅ Create this implementation plan (DONE)
2. 🚀 Inspect existing migrations (NEXT)
3. 🚀 Create migration templates (004-014)
4. 🚀 Implement SupabaseOrganizationRepository
5. 🚀 Create RLS policies
6. 🚀 Implement remaining Supabase repositories
7. 🚀 Update factory
8. 🚀 Create test suites
9. 🚀 Run all tests
10. 🚀 Create completion summary

---

## Timeline Estimate

- **Migrations (004-014):** 2-3 hours
- **Supabase repositories (9 domains):** 4-5 hours
- **RLS policies:** 2-3 hours
- **Factory updates:** 1 hour
- **Test suites (10 domains × 20 scenarios):** 5-6 hours
- **Integration & fixes:** 3-4 hours
- **Documentation:** 2-3 hours

**Total Estimate:** 20-25 hours (assuming no blockers)

---

## Critical Success Factors

1. **RLS Policies Must Enforce Isolation** — This is P0, cannot be bypassed
2. **Demo Mode Must Continue Working** — No breaking changes
3. **TypeScript Compliance** — 0 errors required
4. **Safeguarding Rules** — Identity documents must be protected
5. **RBAC + RLS Defense in Depth** — Both layers must enforce
6. **Repository Pattern Maintained** — Components never call Supabase directly

---

**Date Updated:** 2026-08-09  
**Next Review:** After completing Step 5.1 (Organization domain)  
**Approval Authority:** Engineering Lead (pending governance decision Q2)
