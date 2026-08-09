# Backend Decision Dependencies Register

**Status:** SPECIFICATION ONLY  
**Date:** 2026-08-09  
**Purpose:** Identify all governance decisions blocking backend implementation

---

## Executive Summary

**Backend Specification Status:** 90% COMPLETE  
**Backend Implementation Status:** BLOCKED

**Blocking Decisions (Must resolve before implementation):**
- Q1: Football ID Authority (affects identity model)
- Q2: Multi-Tenancy Model (affects persistence design)
- Q3: Authorization Model (affects access control)
- Q9: Safeguarding Rules (affects data access policies)

**Non-Blocking (Can implement with provisional design):**
- Q4: Season Definition
- Q5: Finance Taxonomy
- Q6: Attendance Semantics
- Q7: Match Lifecycle (mostly clear, see 13-match-lifecycle.md)
- Q8: Age Group Definition
- Q10: Client State Strategy
- Q11: Persistence Strategy
- Q12: Notification Channels

---

## BLOCKING Decisions

### Q1: Football ID Authority

**Question:** Who issues football_id and by what authority?

**Options:**
- (A) bolaID Platform (centralized issuer)
- (B) Federasi Sepak Bola Indonesia (PSSI / Asprov)
- (C) Individual Clubs (self-issued, cross-verifiable)
- (D) Hybrid (PSSI for federated clubs, bolaID for others)

**Impact on Backend:**
- **Issuance Logic:** If PSSI, backend must integrate with federation API/registry
- **Format:** Different options have different validation rules
  - Option A: Numeric or UUID
  - Option B: PSSI-standard format (e.g., `PSSI-{YYYY}-{CLUB}-{NNNN}`)
  - Option C: Club-generated (self-issued)
- **Uniqueness:** Globally unique vs. per-issuer unique?
- **Immutability:** Must guarantee football_id never changes across transfers

**Affected Entities:**
- FootballIdentity (issuer, format, validation)
- Player API endpoint (GET /players/{football_id})
- Identity migration workflows

**Current Specification State:**
- Contracts assume stable football_id (immutable)
- Contracts assume unique football_id globally
- No issuance logic specified (pending Q1)
- Demo data uses format: `FID-{YYYY}-{CLUB}-{NNNN}` (arbitrary)

**Provisional Design (if needed):**
```json
FootballIdentity {
  football_id: string (unique, immutable),
  issuer: enum ("BOLAID" | "PSSI" | "CLUB"),
  format_version: string,
  issued_date: date,
  issued_authority: string
}
```

**Decision Required Before:**
- Data migration from demo model
- Football ID validation rules
- External federation integration (if applicable)

**Status:** IN_REVIEW | Approval Authority UNDEFINED

---

### Q2: Multi-Tenancy Model

**Question:** How is tenant isolation achieved?

**Options:**
- (A) Shared Database + Row-Level Security (RLS) on `organization_id`
- (B) Schema Per Tenant (separate PostgreSQL schema per organization)
- (C) Database Per Tenant (separate PostgreSQL database per organization)

**Impact on Backend:**
- **Persistence:** Query complexity, schema design, migration strategy
- **Authorization:** RLS policies vs. application-layer filtering
- **Performance:** Query planner, index strategy
- **Scalability:** Growth capacity, sharding strategy
- **Cost:** Resource overhead per tenant isolation method

**Current Architecture Specification:**
- Option A (Shared DB + RLS) assumed in 01-domain-contract.md
- All domain entities include `organization_id` foreign key
- db-schema.md uses RLS: `for all to authenticated using (owner_id = auth.uid())`

**Provisional Design (Option A — Shared DB + RLS):**
```sql
-- RLS Policy Example
create policy org_isolation on players
  for all to authenticated
  using (
    club_id in (
      select id from clubs
      where owner_id = auth.uid()
    )
  );
```

**Implications if Q2 != Option A:**
- If Option B (Schema per tenant): All tables must be duplicated per schema; data dictionary management; migration coordination
- If Option C (Database per tenant): Cluster management; federation layer; data synchronization complexity

**Decision Required Before:**
- Database migration code
- RLS policy implementation
- Query optimization (indexes, partitioning)
- Multi-org access control (if allowed)

**Status:** IN_REVIEW | Recommendation: Option A (Shared DB + RLS) | Approval Authority UNDEFINED

---

### Q3: Authorization Model (RBAC vs ABAC)

**Question:** How granular should role-based permissions be?

**Options:**
- (A) Simple RBAC: Roles (ADMIN, COACH, MANAGER, PLAYER, STAFF) → Permissions
- (B) RBAC + Context: Role + Organization + Resource scope
- (C) ABAC: Attributes (user.role, user.org, resource.org, action, context) → decision

**Impact on Backend:**
- **API Gates:** Every endpoint must check authorization
- **Data Filtering:** RLS policies based on auth rules
- **Role Proliferation:** If ABAC, how many attributes and combinations?
- **Guardian Override:** U-18 data access requires guardian consent (cross-cutting)

**Current Specification:**
- 02-api-contract.md assumes simple RBAC:
  ```
  organization:players:read
  organization:players:write
  organization:training:manage
  organization:finance:read
  organization:finance:manage
  ```
- No context-aware rules specified yet

**Provisional Design (Option A — Simple RBAC):**
```json
Role Permissions Mapping {
  "ADMIN": [
    "organization:*:read",
    "organization:*:write",
    "organization:staff:manage"
  ],
  "COACH": [
    "organization:players:read",
    "organization:training:*",
    "organization:competition:read"
  ],
  "MANAGER": [
    "organization:players:*",
    "organization:finance:*"
  ],
  "PLAYER": [
    "organization:players:read:self",
    "organization:training:read",
    "organization:competition:read"
  ]
}
```

**If Q3 = Option B or C:**
- More complex authorization decision logic
- Possible need for Policy Decision Point (PDP) service
- Attribute definition and validation overhead

**Decision Required Before:**
- Authorization middleware implementation
- RLS policy complexity
- Permission validation logic
- Test coverage (authorization matrix)

**Status:** IN_REVIEW | Recommendation: Option A (Simple RBAC) | Approval Authority UNDEFINED

---

### Q9: Safeguarding & Minor Data Controls

**Question:** How should U-18 player data be protected?

**Requirements (Proposed):**
- U-18 player defined by age at season start
- Guardian consent required for:
  - Photo/media publication
  - Medical data access
  - Contact information sharing
  - Data export
- Consent must be explicit (opt-in, not opt-out)
- Child's interest prevails over guardian wishes
- Data retention: age-out at 18

**Impact on Backend:**
- **Data Classification:** Fields marked PROTECTED_MINOR
- **Access Control:** API must check consent before returning sensitive fields
- **Audit Trail:** Guardian consent changes recorded
- **Consent Workflow:** API to request, grant, revoke consent

**Current Specification:**
- GuardianConsent entity defined (see 01-domain-contract.md)
- Safeguarding checks mentioned in API (PATCH /players/{id} requires consent check)
- No detailed policies specified yet

**Provisional Rules:**
```
Rule 1: Player.age < 18 at season_start
Rule 2: GET /players/{playerId} must check:
  - Is player U-18?
  - If yes, does guardian have active consent for DATA_ACCESS?
  - If no consent, return 403 FORBIDDEN or redacted response
Rule 3: Photo publication requires explicit PHOTO consent
Rule 4: Consent can be revoked anytime (data-access stops immediately)
Rule 5: Revoked consent is immutable (audit trail)
```

**If Q9 is More Restrictive:**
- Different permission models per data classification
- Possible API path segregation (public vs. protected)
- Consent proof in audit for compliance

**Decision Required Before:**
- RLS policy for U-18 protection
- API response filtering (sensitive field redaction)
- Consent checking middleware
- Guardian portal / consent management UI

**Status:** IN_REVIEW | Recommendation: Guardian Consent + Role-Limited Access | Approval Authority UNDEFINED

---

## NON-BLOCKING Decisions

These can be implemented with provisional design; refinements won't break contracts.

### Q4: Season Boundary Definition

**Question:** When does a season start/end?

**Options:**
- (A) Calendaric: Jan 1 – Dec 31
- (B) Academic: Jul 1 – Jun 30
- (C) Football League: Aug – May
- (D) Tournament-based: Varies per competition

**Provisional Design:** Store start_date and end_date; application logic uses these

**Impact:** Minimal — persistence and aggregation queries work regardless of boundaries

---

### Q5: Finance Taxonomy

**Question:** What is the definitive category list?

**Options:**
- Flat categories: SPP, REGISTRATION, TOURNAMENT, EQUIPMENT, OPERATIONAL, OTHER
- Hierarchical: SPP → [Monthly, Registration], Equipment → [Jersey, Ball, Cone]
- Open: Custom categories per organization

**Provisional Design:** `Enum + JSON sub_category field for extensibility`

**Impact:** UI filtering and reporting; doesn't block core transactions API

---

### Q6: Attendance Semantics

**Question:** What do attendance statuses mean?

**Options:**
- PRESENT, ABSENT, EXCUSED, SICK, LATE, INCOMPLETE
- Different statuses trigger different workflows (e.g., parents notified if ABSENT)

**Provisional Design:** Status enum + optional reason field

**Impact:** Attendance recording works; business logic around status consequences can be deferred

---

### Q7: Match Lifecycle

**Proposed State Machine:**
```
SCHEDULED
  ├─ LIVE (game starts)
  │  └─ COMPLETED (final score)
  ├─ POSTPONED
  └─ CANCELLED
```

**Provisional Design:** Status enum + immutability rules after COMPLETED

**Impact:** Clear; mostly non-blocking

---

### Q8: Age Group Definition

**Question:** How are age groups calculated and who can participate?

**Provisional Design:** Contextual age derived from `person.dateOfBirth + season.start_date`

**Impact:** Used for filtering teams; doesn't block team membership logic

---

### Q10: Client State Strategy

**Provisional Design:** Route/server state (TanStack Router) + transient UI state (React hooks)

**Impact:** Doesn't affect backend; frontend-only decision

---

### Q11: Persistence Strategy (Non-Sensitive Data Only)

**Provisional Design:** localStorage for theme/language preferences only; no sensitive data cached

**Impact:** Frontend optimization; doesn't affect backend API

---

### Q12: Notification Channels

**Question:** How should notifications be delivered (in-app, email, SMS, WhatsApp)?

**Provisional Design:** In-app notification core implemented; external channel integration deferred

**Impact:** API accepts channel preferences; delivery mechanics deferred

---

## Decision Status Summary

| Q # | Title | Blocking | Status | Approval Authority | Estimated Approval Date |
|---|---|---|---|---|
| Q1 | Football ID Authority | YES | IN_REVIEW | TBD | TBD |
| Q2 | Multi-Tenancy Model | YES | IN_REVIEW | TBD | TBD |
| Q3 | Authorization Model | YES | IN_REVIEW | TBD | TBD |
| Q4 | Season Definition | NO | IN_REVIEW | TBD | TBD |
| Q5 | Finance Taxonomy | NO | IN_REVIEW | TBD | TBD |
| Q6 | Attendance Semantics | NO | IN_REVIEW | TBD | TBD |
| Q7 | Match Lifecycle | NO | IN_REVIEW | TBD | TBD |
| Q8 | Age Group Definition | NO | IN_REVIEW | TBD | TBD |
| Q9 | Safeguarding / PII | YES | IN_REVIEW | TBD | TBD |
| Q10 | Client State Strategy | NO | IN_REVIEW | TBD | TBD |
| Q11 | Persistence Strategy | NO | IN_REVIEW | TBD | TBD |
| Q12 | Notification Channels | NO | IN_REVIEW | TBD | TBD |

---

## Approval Authority Gap

**Critical Issue:** APPROVAL AUTHORITY is not defined.

**Recommendation:**
1. Define who has authority to approve each decision (e.g., Product Owner, Technical Lead, Architecture Council)
2. Establish decision review process and timeline
3. Document approval evidence (meeting minutes, email, ADR approval)

**Current State:** Decisions are PROPOSED but lack explicit approval authority and mechanism

---

## Implementation Blockers

### Cannot Proceed Without Q2 & Q3:
- Database schema design (depends on tenancy model)
- RLS policy implementation (depends on authorization model)
- Data migration code (depends on schema)
- API authorization middleware (depends on auth model)

### Can Proceed Provisionally (with Q2 & Q3 assumed):
- Entity definitions (01-domain-contract.md)
- API contracts (02-api-contract.md)
- OpenAPI specification
- Repository interfaces
- Frontend integration tests (mock API)

---

## Recommended Path Forward

### Phase 1: Resolve Blocking Decisions (Week 1)
- Present Q1, Q2, Q3, Q9 to approval authority
- Document decision rationale
- Record approval evidence
- Update decision register

### Phase 2: Finalize Specification (Week 2)
- Incorporate approved decisions into domain/API contracts
- Update persistence contract (10-persistence-contract.md)
- Update authorization rules (11-authorization-rules.md)
- Create final OpenAPI specification

### Phase 3: Implementation (Week 3+)
- Create Supabase migration scripts
- Implement RLS policies
- Implement API endpoints (Edge Functions or PostgREST)
- Implement repository layer
- Implement frontend integration

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Q1-Q3 decisions delayed | HIGH | BLOCKS backend start | Escalate to authority; interim decisions |
| Football ID format misaligned | MEDIUM | Data migration cost | Validate format early with federation |
| RLS complexity underestimated | MEDIUM | Performance issues | Prototype RLS policies early |
| Guardian consent workflow undefined | MEDIUM | Safeguarding gap | Clarify Q9 early |
| Multi-org access policies unclear | LOW | Authorization issues | Document provisionally; refine post-launch |

---

## Next Steps

1. ✅ Backend specification documents complete (01-15, openapi.yaml)
2. ⏳ Review backend contract with stakeholders
3. ⏳ Resolve blocking decisions (Q1, Q2, Q3, Q9)
4. ⏳ Update approval authority and governance process
5. ⏳ Finalize backend specification
6. ⏳ Begin backend implementation
7. ⏳ Supabase activation and migration
