# PHASE 6 STEP 4: Implementation Plan
## Authentication + Organization Membership + RBAC

**Status:** Ready for Implementation  
**Date:** 2026-08-10  
**Based On:** Complete codebase inspection + governance documents

---

## Executive Summary

STEP 4 will add the security foundation: Supabase Auth integration, User Profiles, Organization Memberships, and RBAC. This enables:

```
User Login
    ↓
User Identity (Supabase Auth)
    ↓
Organization Memberships (Multiple possible)
    ↓
Select Current Organization
    ↓
Current Role + Permissions
    ↓
Feature Access via Permission Guard
    ↓
Repository Scope (club_id → org_id)
    ↓
RLS Enforcement
```

**Key Architectural Decision:** NOT `user_id = org_id`. Users can have memberships in multiple organizations.

---

## Current State (STEP 3 Complete ✅)

### What Exists
```
✅ Supabase client (src/lib/supabase/client.ts)
✅ Repository pattern with factory
✅ Demo/Supabase automatic switching
✅ TanStack Router
✅ RepositoriesProvider (clubId hard-coded "club-default")
✅ QueryClientProvider + SidebarProvider stacked
✅ TypeScript strict mode
✅ RLS policies at database level
✅ AppHeader with Profile Menu + Club Switcher
✅ Hard-coded user data (Agus Setiawan, Manager Klub)
✅ Hard-coded clubs array from demo-data.ts
```

### What Does NOT Exist
```
❌ Supabase Auth integration
❌ User/UserProfile repository
❌ Membership repository
❌ Auth context/provider
❌ Organization context
❌ RBAC permission model
❌ Login page
❌ Route protection
❌ Session persistence
```

### Current Hard-Coded State
| Component | Current | Target |
|-----------|---------|--------|
| clubId in RepositoriesProvider | "club-default" (hardcoded) | From current organization context |
| User in ProfileMenu | Agus Setiawan (hardcoded) | From Supabase Auth |
| Clubs in ClubSwitcher | Demo clubs array | From membership repository |
| Logout button | Disabled | Functional |
| Routes | All public | Protected by auth guard |

---

## Database Schema Changes (STEP 4)

### NEW Table: user_profiles
```sql
id                  UUID PRIMARY KEY
auth_user_id        UUID NOT NULL (references auth.users)
display_name        TEXT NOT NULL
email               TEXT NOT NULL (unique)
phone               TEXT
avatar_url          TEXT
status              ENUM ('active', 'inactive', 'suspended')
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

### NEW Table: organization_memberships
```sql
id                  UUID PRIMARY KEY
user_id             UUID NOT NULL (references user_profiles)
organization_id     UUID NOT NULL (references clubs)
role                TEXT NOT NULL (stored as role code: "ORG_OWNER", etc.)
status              ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'REVOKED')
joined_at           TIMESTAMPTZ
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ

UNIQUE(user_id, organization_id)
```

### RLS Policy Changes
**From:** Organization scoped by hardcoded auth.club_id  
**To:** User must have ACTIVE membership for that organization

Example new policy:
```sql
-- User can access resources only from organizations they have ACTIVE membership in
WHERE EXISTS (
  SELECT 1 FROM organization_memberships m
  WHERE m.user_id = auth.uid()
  AND m.organization_id = players.club_id
  AND m.status = 'ACTIVE'
)
```

---

## Repository Architecture Changes

### NEW Repositories to Add
```
src/repositories/
  ├─ auth/
  │   ├─ auth-types.ts              [NEW]
  │   ├─ auth-repository.ts         [NEW]
  │   ├─ supabase-auth-repository.ts [NEW]
  │   └─ demo-auth-repository.ts     [NEW]
  │
  ├─ user-profile/
  │   ├─ user-profile-repository.ts  [NEW]
  │   ├─ supabase-user-profile-repository.ts [NEW]
  │   └─ demo-user-profile-repository.ts [NEW]
  │
  └─ membership/
      ├─ membership-repository.ts     [NEW]
      ├─ supabase-membership-repository.ts [NEW]
      └─ demo-membership-repository.ts [NEW]
```

### Type Definition Changes
```
User (NEW)
  ├─ id: UUID
  ├─ authUserId: string (Supabase Auth UID)
  ├─ displayName: string
  ├─ email: string
  └─ ...

Membership (NEW)
  ├─ id: UUID
  ├─ userId: UUID
  ├─ organizationId: UUID
  ├─ role: string
  └─ status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'REVOKED'

AuthSession (NEW)
  ├─ user: User | null
  ├─ loading: boolean
  ├─ error: Error | null
```

### Repositories Interface Update
```typescript
// STEP 3 (current)
interface Repositories {
  player, staff, team, season, training, competition, match, 
  finance, notification, activity, organization, identityDocument
}

// STEP 4 (new)
interface Repositories {
  // ... existing ...
  auth: AuthRepository;           [NEW]
  userProfile: UserProfileRepository; [NEW]
  membership: MembershipRepository;   [NEW]
}
```

### Factory Pattern Update
```
createSupabaseRepositories()
  ├─ NEW: createSupabaseAuthRepository()
  ├─ NEW: createSupabaseUserProfileRepository()
  ├─ NEW: createSupa baseMembershipRepository()
  └─ ... existing repos ...

createDemoRepositories()
  ├─ NEW: createDemoAuthRepository()
  ├─ NEW: createDemoUserProfileRepository()
  ├─ NEW: createDemoMembershipRepository()
  └─ ... existing repos ...
```

---

## Auth Architecture (NEW)

### Supabase Auth Provider
```typescript
interface AuthRepository {
  getCurrentUser(): Promise<User | null>
  getCurrentSession(): Promise<Session | null>
  signIn(email: string, password: string): Promise<Session>
  signOut(): Promise<void>
  signUp(email: string, password: string): Promise<Session>
  resetPassword(email: string): Promise<void>
  onAuthStateChange(callback): Unsubscribe
}
```

### Demo Auth Provider (for demo mode)
- Simulates Supabase Auth locally
- Stores session in localStorage
- Supports same interface as SupabaseAuthRepository
- Uses demo users from demo-data.ts

### Auth Context (NEW)
```typescript
interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  error: Error | null
  signIn: (email, password) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

// Usage in components:
const { user, loading, signIn, isAuthenticated } = useAuth()
```

---

## Organization Context (NEW)

### Current Organization Selection
```typescript
interface OrganizationContext {
  currentOrganization: Organization | null
  setCurrentOrganization: (org: Organization) => void
  memberships: Membership[]
  loading: boolean
}

// LocalStorage: Only for UX (selection preference)
// Authority: Backend RLS + membership verification
```

### Organization Switcher (UPDATE existing)
```typescript
// Current: uses hardcoded demo clubs array
// New: uses membership repository to load actual memberships

ClubSwitcher
  ├─ Fetch memberships for current user
  ├─ Display list of organizations user belongs to
  ├─ Allow switching current organization
  └─ Update context + repository scope
```

---

## RBAC Model (NEW)

### Roles (Baseline)
```
PLATFORM_ADMIN     → Full platform access + auditing
ORG_OWNER          → Full organization + members
ORG_ADMIN          → Organization operations
MANAGER            → Operations + team management
COACH              → Team training + attendance
STAFF              → Read-only operations + basic task
FINANCE            → Finance operations only
VIEWER             → Read-only access
```

### Permissions (Centralized)
```
// Centralized permission model
src/lib/rbac/permissions.ts

PERMISSIONS = {
  // Players
  "players.read": { description: "Read player records", roles: [...] }
  "players.create": { ... }
  "players.update": { ... }
  "players.delete": { ... }
  
  // Training
  "training.read": { ... }
  "training.create": { ... }
  "training.update": { ... }
  
  // Finance
  "finance.read": { ... }
  "finance.create": { ... }
  "finance.update": { ... }
  "finance.delete": { ... }
  
  // Membership
  "membership.read": { ... }
  "membership.manage": { ... }
  
  // Organization
  "organization.read": { ... }
  "organization.manage": { ... }
  
  // ... etc ...
}
```

### Permission Matrix
```
Role             | players.* | training.* | finance.* | org.* | member.*
-----------------|-----------|-----------|-----------|-------|----------
PLATFORM_ADMIN   | ✓         | ✓         | ✓         | ✓     | ✓
ORG_OWNER        | ✓         | ✓         | ✓         | ✓     | ✓
ORG_ADMIN        | ✓         | ✓         | ✓ (R)     | ✓ (R) | ✓ (R)
MANAGER          | ✓         | ✓         | ✓ (R)     | - (R) | - (R)
COACH            | ✓ (R)     | ✓         | - (R)     | -     | -
STAFF            | ✓ (R)     | ✓ (R)     | - (R)     | -     | -
FINANCE          | - (R)     | -         | ✓         | -     | -
VIEWER           | ✓ (R)     | ✓ (R)     | ✓ (R)     | ✓ (R) | ✓ (R)

Legend: ✓ = Full, ✓ (R) = Read-only, - = None
```

### Permission Guard (NEW)
```typescript
// Components can check permissions:
const canEditPlayer = useCanAccess("players.update")
const canManageMembers = useCanAccess("membership.manage")

// Guards for routes:
<ProtectedRoute permission="players.create" component={CreatePlayer} />

// Guards for mutations:
const { mutate: deletePlayer } = useDeletePlayer({
  requiresPermission: "players.delete"
})
```

---

## Route Protection (NEW)

### Public Routes
```
/login
/forgot-password
```

### Protected Routes (with auth check)
```
/                   (dashboard)
/pemain             (player list)
/pemain/$id         (player profile)
/latihan            (training)
/kompetisi          (competition)
/keuangan           (finance)
/staf               (staff)
/tim                (team)
/musim              (season)
/notifikasi         (notification)
/aktivitas          (activity)
/pengaturan         (settings)
```

### Route Guard Logic
```typescript
IF NOT authenticated
  → redirect /login

ELSE IF NO organization membership
  → show "No Organization" state
  
ELSE IF membership suspended
  → show "Suspended" state
  
ELSE IF has membership but no permission for route
  → show "Access Denied" state
  
ELSE
  → render page
```

---

## UI Changes (MINIMAL - Preserve Existing)

### Login Page (NEW)
- Email/password form
- Forgot password link
- Sign up link (optional)
- Design: Follow bolaID design system
- Typography: Bebas Neue + Barlow
- Colors: Field green + energetic accent
- Support: Dark mode + responsive

### AppHeader Changes (MINIMAL)
- ProfileMenu: Replace hardcoded user with `useAuth()` data
- ProfileMenu logout button: Enable + functional
- ClubSwitcher: Replace demo clubs with memberships from repo
- Keep existing UI/UX intact

### New States to Render
- `<SessionLoadingScreen />`
- `<NoOrganizationState />`
- `<MembershipSuspendedState />`
- `<AccessDeniedState />`
- `<SessionExpiredState />`

### Demo Mode (UNCHANGED)
- All existing screens still work
- Demo auth simulates login/logout
- Demo memberships simulated
- Fallback if Supabase Auth not configured

---

## Implementation Sequence

### Phase 1: Type Definitions & Repositories (Blocks UI)
```
STEP 4.1  Create auth-types.ts (User, Session, AuthResult)
STEP 4.2  Create AuthRepository interface
STEP 4.3  Create DemoAuthRepository implementation
STEP 4.4  Create SupabaseAuthRepository implementation
STEP 4.5  Create UserProfileRepository
STEP 4.6  Create MembershipRepository
```

### Phase 2: Context & Auth Provider (Enables Auth)
```
STEP 4.7  Create AuthContext + AuthProvider
STEP 4.8  Create OrganizationContext + Provider
STEP 4.9  Create RBAC permission model (permissions.ts)
STEP 4.10 Create permission guard utilities (useCanAccess)
```

### Phase 3: UI & Integration (Makes App Work)
```
STEP 4.11 Create login page
STEP 4.12 Create route protection component
STEP 4.13 Update AppHeader (profile + club switcher)
STEP 4.14 Create empty/error states
```

### Phase 4: Database & Backend (Enables Supabase)
```
STEP 4.15 Create database migration (user_profiles + memberships)
STEP 4.16 Update RLS policies for membership-based access
STEP 4.17 Connect repositories to RepositoriesContext
```

### Phase 5: Verification & Quality (Ship Quality)
```
STEP 4.18 Verify demo auth mode works
STEP 4.19 Verify Supabase auth mode works (when configured)
STEP 4.20 Run TypeScript check (0 errors)
STEP 4.21 Run production build (PASS)
STEP 4.22 Test all roles + permissions
STEP 4.23 Test cross-org isolation
STEP 4.24 Generate final report
```

---

## Quality Gates for STEP 4 Completion

### Must Pass
```
[ ] TypeScript: 0 errors (strict mode)
[ ] Build: Successful (< 2s)
[ ] Existing UI: UNCHANGED (all routes work)
[ ] Demo mode: FULLY FUNCTIONAL (no Supabase required)
[ ] Supabase mode: LOGIN + MEMBERSHIPS work
[ ] Auth flow: Login → Memberships → Org selection → Access
[ ] RBAC: Roles enforced at 3 layers (guard + repo + RLS)
[ ] Cross-org: User A cannot read Organization B data
[ ] Permission matrix: All roles tested + documented
[ ] Route protection: Unauthorized access → error state
[ ] PII protection: Identity numbers NOT in logs/URLs
[ ] Session persistence: Auth survives page refresh
[ ] Mobile: Login + selector work on small screens
[ ] Dark mode: Auth UI styled correctly
[ ] Accessibility: WCAG compliant
[ ] Documentation: Complete architecture + testing guide
```

---

## Risk Mitigation

### Risk: Breaking existing CRUD
**Mitigation:** 
- Don't modify repository interfaces until after Phase 1 testing
- Keep demo mode unchanged until STEP 4.18
- Gradual migration: auth independent from existing repos

### Risk: clubId scope vs userId scope
**Mitigation:** 
- Organization ID = Club ID (provisional)
- Membership links User → Club
- RLS uses membership verification, not direct club ownership
- Can migrate to separate org table later

### Risk: Session state explosion
**Mitigation:**
- Use context only for auth + org selection
- Repositories already handle CRUD state (TanStack Query)
- No additional state management (no Zustand)

### Risk: Auth library lock-in (Supabase)
**Mitigation:**
- Repository abstraction: SupabaseAuthRepository vs DemoAuthRepository
- Can swap for another auth provider later
- Demo mode works without Supabase

### Risk: PII exposure through new endpoints
**Mitigation:**
- All PII (identity numbers) stays in identity repository
- User profile repository only has: email, name, phone, avatar
- Masking still applied at display layer
- RLS prevents unauthorized access

---

## Provisional Decisions (Marked for Later Review)

### P1: Organization ID = Club ID
**Status:** PROVISIONAL  
**Reason:** Simplified initial model  
**Plan to Replace:** STEP 5+ can separate organizations from clubs

### P2: Role stored as TEXT (not separate table)
**Status:** PROVISIONAL  
**Reason:** Simpler queries, less joins  
**Plan to Replace:** Can normalize to role_id FK later

### P3: Permission matrix hardcoded in TypeScript
**Status:** PROVISIONAL  
**Reason:** No need for dynamic permission management yet  
**Plan to Replace:** Move to database + admin UI in STEP 6+

### P4: Single current organization (not multi-select)
**Status:** PROVISIONAL  
**Reason:** Simpler UX for MVP  
**Plan to Replace:** Can enable multi-org context switching later

---

## Testing Strategy

### Unit Tests (Ready)
- DemoAuthRepository sign-in/out
- SupabaseAuthRepository session handling
- Permission matrix matches role definitions
- Membership isolation logic

### Integration Tests (Ready)
- Login → load memberships → select org → repository scope
- Switch org → verify all queries rescoped
- Access denied for unauthorized role
- Cross-org data isolation

### Manual Tests (Required)
- Login with email/password
- Logout functionality
- Membership switcher updates org context
- All routes accessible when authenticated
- Access denied page shows when permission denied
- Demo mode works without Supabase
- Supabase mode works with real auth
- Mobile responsive login
- Dark mode styling

---

## Migration Path (Future)

### To STEP 5
- Move permission matrix to database
- Implement dynamic role configuration
- Add audit event persistence
- Guardian-child relationships
- Protected minor data restrictions

### To STEP 6
- Admin role management UI
- Organization structure UI
- Invitation workflow UI
- Multi-org context switching

### To STEP 7+
- Audit trail analysis
- Compliance reporting
- Advanced role-based context (ABAC)
- Third-party SSO integration

---

## Success Criteria Summary

| Component | Pass Criteria | Verification |
|-----------|---|---|
| Auth | Login → Session → Access | Manual test |
| Membership | User → Orgs → Role → Permission | Database + RLS test |
| RBAC | Roles enforce at 3 layers | Permission matrix test |
| Routes | Protected + error states | Route access test |
| Demo | Works without Supabase | Unplug Supabase key |
| Supabase | Works with real auth | Configure + login |
| Quality | TS 0 errors, Build PASS | `npm run build` |
| Security | No PII exposed | Log/URL audit |
| UI | Existing unchanged | Screenshot comparison |

---

## What's Next

**Ready to begin STEP 4.1 (Auth Types)?**

OR

**Review this plan first?** → Provide feedback on:
- Database schema
- Repository architecture
- Permission matrix
- UI approach
- Timeline/phasing

**Once approved:** Execute sequentially, verify each gate, generate final report.

---

**Plan Status:** ✅ READY FOR REVIEW  
**Inspection Completed:** 2026-08-10  
**Estimated Duration:** 6-8 hours (depending on testing rigor)  
**Quality Target:** Same as STEP 3 (TS 0 errors, build PASS, existing UI preserved)
