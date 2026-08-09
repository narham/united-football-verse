# Backend Domain Contract — bolaID Football OS v1.0

**Status:** SPECIFICATION ONLY — No Implementation  
**Date:** 2026-08-09  
**Dependencies:** Q1, Q2, Q3, Q9 (all IN_REVIEW, not approved)

---

## Executive Summary

This document defines the domain entities, aggregates, and relationships that form the foundation for the backend contract. It derives from:
- Frontend Product Readiness audit (15 routes, 91% quality)
- Demo data model (stable structure)
- Proposed governance decisions (Q1-Q12, still pending approval)

**Key Principle:** The domain model separates concerns across three layers:
1. **Identity Layer** — Stable person/football identity
2. **Organization Layer** — Club/team/season membership
3. **Operational Layer** — Training, competition, finance

This prevents identity thrashing when organization membership changes.

---

## Bounded Contexts

The platform spans these distinct business domains:

```
Identity Context
  └─ Person
  └─ FootballIdentity (stable reference)
  └─ GuardianConsent (safeguarding)

Organization Context
  └─ Organization (club, academy, ssb)
  └─ OrganizationMembership
  └─ Role (staff_role, app_role)
  └─ Season

Team Context
  └─ Team
  └─ TeamMembership
  └─ PlayerAssignment

Training Context
  └─ TrainingSession
  └─ TrainingSchedule
  └─ Attendance

Competition Context
  └─ Competition
  └─ CompetitionSeason
  └─ Fixture
  └─ Match
  └─ Lineup
  └─ MatchEvent
  └─ Standing

Finance Context
  └─ Transaction
  └─ Invoice
  └─ Payment (future)
  └─ FinancialCategory

Notification Context
  └─ Notification
  └─ NotificationPreference
  └─ DeliveryChannel

Audit Context
  └─ ActivityFeed (operational)
  └─ AuditLog (compliance)

Safeguarding Context
  ├─ MinorDataAccess
  ├─ ConsentRecord
  └─ DataClassification
```

---

## Entity Definitions

### Identity Context

#### 1. Person
**Purpose:** Root entity representing a real human being  
**Identity:** Unique person ID (UUID)  
**Attributes:**
- id (UUID, primary key)
- firstName
- lastName
- dateOfBirth (YYYY-MM-DD)
- gender (optional)
- email (unique, optional)
- mobilePhone (optional)
- nationality
- nik / idNumber (national ID, optional)
- createdAt (timestamp)
- updatedAt (timestamp)

**Lifecycle:** CREATED → ACTIVE → ARCHIVED (soft delete)

**Owner:** Individual or guardian (for minors)

**Safeguarding:** dateOfBirth used to determine if U-18; if yes, guardian consent required

**Note:** Person data is NOT club-scoped. It's platform-level.

---

#### 2. FootballIdentity
**Purpose:** Stable identity reference for football player that persists across club transfers  
**Identity:** football_id (unique string, immutable)  
**Attributes:**
- id (UUID, primary key)
- football_id (string, unique, immutable) — public identifier
- person_id (UUID, FK → Person)
- issuedBy (enum: BOLAID | FEDERATION | CLUB) — Q1 dependency
- issuedDate (YYYY-MM-DD)
- issuedAuthority (text) — e.g., "Supabase/bolaID", "PSSI", "SSB Garuda"
- status (enum: ACTIVE | SUSPENDED | RETIRED | TRANSFERRED)
- createdAt
- updatedAt

**Lifecycle:** ISSUED → ACTIVE → SUSPENDED (by authority) | RETIRED (voluntary) | TRANSFERRED (federation transfer)

**Owner:** Issuing authority (federation, bolaID, club)

**Critical Rule:** football_id MUST NOT change. It is the stable reference.

**Cross-Org Reference:** A single football_id may be held by the same person across multiple clubs over time.

---

### Organization Context

#### 3. Organization
**Purpose:** Represents club, academy, or SSB  
**Identity:** organization_id (UUID, primary key)  
**Attributes:**
- id (UUID)
- name (text, not unique — name collision possible)
- short (text, short name / abbreviation)
- type (enum: SSB | ACADEMY | CLUB | FEDERATION) — Q2 decision
- city (text)
- province (text)
- foundedYear (int)
- footballOrgId (text, FK to federation authority if applicable)
- logoUrl (text, optional)
- status (enum: ACTIVE | INACTIVE | SUSPENDED)
- createdAt
- updatedAt

**Lifecycle:** CREATED → ACTIVE → INACTIVE (voluntary) | SUSPENDED (by authority)

**Owner:** Organization administrator or federation (for official clubs)

**Tenancy Boundary:** Q2 decision determines shared DB + RLS vs. schema per org

---

#### 4. OrganizationMembership
**Purpose:** Records a person's membership in an organization with role assignment  
**Identity:** Composite (person_id, organization_id, started_at)  
**Attributes:**
- id (UUID, optional PK for convenience)
- person_id (UUID, FK → Person)
- organization_id (UUID, FK → Organization)
- role (enum: ADMIN | COACH | MANAGER | PLAYER | STAFF | GUARDIAN | FEDERATION_OFFICIAL)
- started_at (YYYY-MM-DD)
- ended_at (YYYY-MM-DD, nullable — null = active)
- status (enum: ACTIVE | ON_LEAVE | SUSPENDED | TERMINATED)
- appointedBy (UUID, FK → Person, nullable)
- createdAt
- updatedAt

**Lifecycle:**
```
ACTIVE
  ├─ ON_LEAVE (temporary pause)
  ├─ SUSPENDED (by authority)
  └─ TERMINATED (end date set)
```

**Owner:** Organization

**Rule:** Multiple concurrent memberships in different orgs are allowed. A coach may be:
- COACH at SSB Garuda
- COACH at Academy Jaya
- MANAGER at Club Bintang

---

#### 5. Season
**Purpose:** Explicit season entity defining operational boundary  
**Identity:** Composite (organization_id, season_code)  
**Attributes:**
- id (UUID)
- organization_id (UUID, FK → Organization)
- season_code (text, e.g., "2026/2027", "U-19_2026")
- start_date (YYYY-MM-DD)
- end_date (YYYY-MM-DD)
- status (enum: PLANNED | ACTIVE | CLOSED | ARCHIVED)
- name (text, display name)
- description (text, optional)
- createdAt
- updatedAt

**Lifecycle:** PLANNED → ACTIVE → CLOSED → ARCHIVED

**Owner:** Organization

**Scope Boundary:** All stats, training, matches, and team assignments are scoped to season.

---

### Team Context

#### 6. Team
**Purpose:** Represents a playing team (U-12, U-15, U-19, etc.)  
**Identity:** team_id (UUID, primary key)  
**Attributes:**
- id (UUID)
- organization_id (UUID, FK → Organization)
- season_id (UUID, FK → Season)
- name (text, e.g., "U-19 A", "Akademi Muda")
- ageGroup (text, e.g., "U-12", "U-19", "Senior")
- division (text, optional, e.g., "Divisi 1", "Cadangan")
- status (enum: ACTIVE | INACTIVE | SUSPENDED)
- createdAt
- updatedAt

**Lifecycle:** ACTIVE → INACTIVE (end of season) | SUSPENDED

**Owner:** Organization

**Rule:** Team is season-scoped. A new team object is created for each season.

---

#### 7. TeamMembership
**Purpose:** Records player assignment to team for specific season  
**Identity:** Composite (player_id, team_id, season_id)  
**Attributes:**
- id (UUID)
- football_id (string, FK → FootballIdentity.football_id) — reference to stable identity
- team_id (UUID, FK → Team)
- season_id (UUID, FK → Season)
- position (enum: GK | DF | MF | FW)
- shirtNumber (int, unique per team per season)
- status (enum: ACTIVE | RESERVE | INJURED | ON_LOAN | TRANSFERRED)
- joinedAt (YYYY-MM-DD)
- leftAt (YYYY-MM-DD, nullable)
- createdAt
- updatedAt

**Lifecycle:**
```
ACTIVE
  ├─ RESERVE (benched)
  ├─ INJURED (temporary)
  ├─ ON_LOAN (to other org)
  └─ TRANSFERRED (permanent move)
```

**Owner:** Organization (team owner)

**Rule:** A player can have multiple team memberships in one season (e.g., U-19 main team + Cadangan).

---

### Training Context

#### 8. TrainingSession
**Purpose:** Represents a scheduled training session  
**Identity:** training_session_id (UUID, primary key)  
**Attributes:**
- id (UUID)
- organization_id (UUID, FK → Organization)
- season_id (UUID, FK → Season)
- team_id (UUID, FK → Team, optional — can be org-level)
- title (text, e.g., "Ball Control Drills")
- dayOfWeek (enum: MONDAY | TUESDAY | ... | SUNDAY) — template level
- startTime (HH:MM)
- endTime (HH:MM)
- location (text, e.g., "Lapangan A")
- focus (text, comma-separated tags: "Passing,Conditioning,Tactics")
- coach_id (UUID, FK → Person, optional)
- status (enum: SCHEDULED | RESCHEDULED | CANCELLED | COMPLETED)
- occurrenceDate (YYYY-MM-DD, specific instance)
- notes (text, optional)
- createdAt
- updatedAt

**Lifecycle:** SCHEDULED → RESCHEDULED (by coach) | CANCELLED (by coach) | COMPLETED

**Owner:** Organization

**Note:** TrainingSession is a template (dayOfWeek + time). Individual occurrences are tracked via occurrenceDate.

---

#### 9. Attendance
**Purpose:** Records player attendance at training or event  
**Identity:** Composite (player_id, training_id, occurrence_date)  
**Attributes:**
- id (UUID)
- football_id (string, FK → FootballIdentity.football_id)
- training_session_id (UUID, FK → TrainingSession)
- occurrence_date (YYYY-MM-DD, specific instance date)
- status (enum: PRESENT | ABSENT | EXCUSED | SICK | LATE | INCOMPLETE)
- checkInTime (HH:MM, optional)
- checkOutTime (HH:MM, optional)
- recordedBy (UUID, FK → Person, optional)
- notes (text, optional)
- createdAt
- updatedAt

**Lifecycle:** Initially ABSENT; coach updates to PRESENT | EXCUSED | SICK | LATE

**Owner:** Organization / Team

**Safeguarding:** If player is U-18, guardian may need to approve absence reason.

---

### Competition Context

#### 10. Competition
**Purpose:** Represents a tournament or league  
**Identity:** competition_id (UUID, primary key)  
**Attributes:**
- id (UUID)
- name (text, e.g., "Piala Gensa Cup")
- organizer (text, optional, e.g., "PSSI", "Local Federation")
- level (text, e.g., "Regional", "National")
- status (enum: PLANNED | ACTIVE | COMPLETED | CANCELLED)
- createdAt
- updatedAt

**Lifecycle:** PLANNED → ACTIVE → COMPLETED | CANCELLED

**Owner:** Organizer (federation, platform)

**Note:** Competition is platform-level. Clubs participate in competition seasons.

---

#### 11. CompetitionSeason
**Purpose:** Specific instance of competition in a season  
**Identity:** Composite (competition_id, season_code)  
**Attributes:**
- id (UUID)
- competition_id (UUID, FK → Competition)
- season_code (text, e.g., "2026")
- startDate (YYYY-MM-DD)
- endDate (YYYY-MM-DD)
- status (enum: REGISTRATION | ACTIVE | CLOSED | ARCHIVED)
- rules (text, optional, JSON-serialized competition rules)
- createdAt
- updatedAt

**Lifecycle:** REGISTRATION → ACTIVE → CLOSED → ARCHIVED

**Owner:** Organizer

---

#### 12. Fixture
**Purpose:** Match schedule in a competition season  
**Identity:** fixture_id (UUID, primary key)  
**Attributes:**
- id (UUID)
- competitionSeason_id (UUID, FK → CompetitionSeason)
- homeTeam_id (UUID, FK → Team)
- awayTeam_id (UUID, FK → Team)
- scheduledDate (YYYY-MM-DD HH:MM)
- venue (text)
- refereeAssignment (UUID, FK → Person, optional)
- status (enum: SCHEDULED | POSTPONED | RESCHEDULED | PLAYED | CANCELLED)
- createdAt
- updatedAt

**Lifecycle:** SCHEDULED → POSTPONED | RESCHEDULED | PLAYED | CANCELLED

**Owner:** Competition organizer

---

#### 13. Match
**Purpose:** Actual match instance  
**Identity:** match_id (UUID, primary key)  
**Attributes:**
- id (UUID)
- fixture_id (UUID, FK → Fixture, optional — matches can be standalone)
- organization_id (UUID, FK → Organization) — club owning the perspective
- competitionSeason_id (UUID, FK → CompetitionSeason)
- homeTeam_id (UUID, FK → Team)
- awayTeam_id (UUID, FK → Team)
- scheduledDate (YYYY-MM-DD HH:MM)
- startedAt (YYYY-MM-DD HH:MM, nullable — null until match starts)
- completedAt (YYYY-MM-DD HH:MM, nullable — null until final score)
- venue (text)
- refereeAssignment (UUID, FK → Person, optional)
- homeScore (int, nullable)
- awayScore (int, nullable)
- result (enum: NOT_PLAYED | HOME_WIN | AWAY_WIN | DRAW | ABANDONED)
- status (enum: SCHEDULED | LIVE | COMPLETED | ABANDONED | CANCELLED)
- notes (text, optional)
- createdAt
- updatedAt

**Lifecycle:**
```
SCHEDULED
  ├─ LIVE (starts)
  │  └─ COMPLETED (final score recorded)
  ├─ CANCELLED
  └─ ABANDONED
```

**Owner:** Match organizer / competition

**Critical Invariant:** homeScore and awayScore MUST be non-null when status = COMPLETED.

---

#### 14. Lineup
**Purpose:** Team sheet for a match  
**Identity:** lineup_id (UUID, primary key)  
**Attributes:**
- id (UUID)
- match_id (UUID, FK → Match)
- team_id (UUID, FK → Team)
- submittedBy (UUID, FK → Person)
- submittedAt (YYYY-MM-DD HH:MM)
- status (enum: DRAFT | SUBMITTED | APPROVED | REJECTED | CHANGED)
- formation (text, e.g., "4-3-3")
- players (JSON array of player assignments)
- createdAt
- updatedAt

**Lifecycle:** DRAFT → SUBMITTED → APPROVED | REJECTED | CHANGED

**Owner:** Team / Organization

**Schema for players array (conceptual):**
```json
[
  {
    "football_id": "FID-001",
    "position": "GK",
    "shirtNumber": 1,
    "role": "STARTER"
  },
  {
    "football_id": "FID-002",
    "position": "DF",
    "shirtNumber": 2,
    "role": "STARTER"
  }
]
```

---

#### 15. MatchEvent
**Purpose:** Individual event during match (goal, card, substitution, etc.)  
**Identity:** matchEvent_id (UUID, primary key)  
**Attributes:**
- id (UUID)
- match_id (UUID, FK → Match)
- minute (int, e.g., 45, 90+3)
- eventType (enum: GOAL | ASSIST | YELLOW_CARD | RED_CARD | SUBSTITUTION | INJURY | OTHER)
- player_id (UUID, FK → Person, the acting player)
- involvedPlayer_id (UUID, FK → Person, optional — for assists, substitutions)
- team_id (UUID, FK → Team, the team responsible)
- metadata (JSON, event-specific data)
- recordedBy (UUID, FK → Person)
- recordedAt (YYYY-MM-DD HH:MM)
- createdAt
- updatedAt

**Lifecycle:** Immutable after match completion

**Owner:** Match / Competition

**Invariant:** After match.status = COMPLETED, no new events may be created.

---

#### 16. Standing
**Purpose:** League standings (points, goals, form)  
**Identity:** Composite (competitionSeason_id, team_id)  
**Attributes:**
- id (UUID)
- competitionSeason_id (UUID, FK → CompetitionSeason)
- team_id (UUID, FK → Team)
- gamesPlayed (int)
- wins (int)
- draws (int)
- losses (int)
- goalsFor (int)
- goalsAgainst (int)
- goalDifference (int, computed: goalsFor - goalsAgainst)
- points (int, computed: wins*3 + draws*1)
- lastUpdatedAt (YYYY-MM-DD HH:MM)
- createdAt
- updatedAt

**Lifecycle:** Computed; updated after each match completion

**Owner:** Competition / Platform

---

### Finance Context

#### 17. Transaction
**Purpose:** Financial record (income or expense)  
**Identity:** transaction_id (UUID, primary key)  
**Attributes:**
- id (UUID)
- organization_id (UUID, FK → Organization)
- date (YYYY-MM-DD)
- type (enum: INCOME | EXPENSE)
- category (enum: SPP | REGISTRATION | TOURNAMENT | EQUIPMENT | OPERATIONAL | OTHER)
- amount (bigint, stored in minor units, e.g., 1500000 = IDR 1.5M)
- currency (text, default: "IDR")
- description (text)
- reference (text, optional, e.g., invoice number)
- paidBy (UUID, FK → Person, optional)
- paidTo (text, optional, vendor name)
- status (enum: PENDING | RECORDED | VERIFIED | RECONCILED | VOIDED)
- approvedBy (UUID, FK → Person, optional)
- approvedAt (YYYY-MM-DD HH:MM, optional)
- notes (text, optional)
- createdAt
- updatedAt

**Lifecycle:** PENDING → RECORDED → VERIFIED → RECONCILED | VOIDED

**Owner:** Organization

**Rule:** amount always stored in minor units (no floating point)

---

#### 18. Invoice (Future)
**Purpose:** Formal billing document (not yet implemented)  
**Status:** SPECIFICATION ONLY

**Planned Attributes:**
- id (UUID)
- organization_id (UUID)
- invoiceNumber (text, unique per org)
- issueDate (YYYY-MM-DD)
- dueDate (YYYY-MM-DD)
- billTo (text or person_id)
- items (array of line items)
- totalAmount (bigint, minor units)
- status (DRAFT | ISSUED | PAID | OVERDUE | CANCELLED)

---

### Notification Context

#### 19. Notification
**Purpose:** User-facing notification  
**Identity:** notification_id (UUID, primary key)  
**Attributes:**
- id (UUID)
- recipient_id (UUID, FK → Person)
- type (enum: TRAINING | MATCH | FINANCE | SYSTEM | SAFEGUARDING)
- title (text)
- message (text)
- relatedEntity_type (text, e.g., "Match", "TrainingSession")
- relatedEntity_id (UUID, optional)
- deliveryChannels (array of enums: IN_APP | EMAIL | SMS | WHATSAPP)
- deliveryStatus (enum: PENDING | DELIVERED | FAILED | READ | ARCHIVED)
- createdAt
- updatedAt
- readAt (YYYY-MM-DD HH:MM, optional)

**Lifecycle:** PENDING → DELIVERED | FAILED → READ | ARCHIVED

**Owner:** Platform

---

#### 20. NotificationPreference
**Purpose:** User preference for notification delivery  
**Identity:** Composite (person_id, notification_type)  
**Attributes:**
- id (UUID)
- person_id (UUID, FK → Person)
- notificationType (enum or text)
- enabledChannels (array of enums)
- optOutReason (text, optional)
- updatedAt

**Lifecycle:** User-managed preferences

**Owner:** User

---

### Audit Context

#### 21. ActivityFeed
**Purpose:** Human-readable operational activity  
**Identity:** activity_id (UUID, primary key)  
**Attributes:**
- id (UUID)
- organization_id (UUID, FK → Organization)
- actor_id (UUID, FK → Person)
- action (text, e.g., "Created match", "Updated player stats")
- entityType (text, e.g., "Player", "Match", "Transaction")
- entityId (UUID)
- timestamp (YYYY-MM-DD HH:MM)
- metadata (JSON, optional)

**Owner:** Organization

**Rule:** Not tamper-resistant; for display only.

---

#### 22. AuditLog
**Purpose:** Compliance / security audit trail  
**Identity:** auditLog_id (UUID, primary key)  
**Attributes:**
- id (UUID)
- organization_id (UUID, FK → Organization)
- actor_id (UUID, FK → Person)
- action (enum: CREATE | READ | UPDATE | DELETE | LOGIN | EXPORT | CONSENT_GRANT | CONSENT_REVOKE)
- resource (text, e.g., "Player", "Transaction")
- resourceId (UUID)
- changesBefore (JSON, optional — previous state)
- changesAfter (JSON, optional — new state)
- ipAddress (text, optional)
- userAgent (text, optional)
- result (enum: SUCCESS | FAILURE)
- timestamp (YYYY-MM-DD HH:MM:SS)
- createdAt

**Owner:** Organization

**Rule:** Immutable after creation. Used for compliance and forensics.

---

### Safeguarding Context

#### 23. GuardianConsent
**Purpose:** Tracks parental/guardian consent for minor data access  
**Identity:** consent_id (UUID, primary key)  
**Attributes:**
- id (UUID)
- minor_id (UUID, FK → Person, person.age < 18)
- guardian_id (UUID, FK → Person)
- consentType (enum: DATA_ACCESS | PHOTO | MEDICAL | TRANSFER | DATA_EXPORT)
- purpose (text)
- grantedAt (YYYY-MM-DD HH:MM)
- expiresAt (YYYY-MM-DD, optional)
- status (enum: PENDING | GRANTED | DENIED | REVOKED | EXPIRED)
- revokedAt (YYYY-MM-DD HH:MM, optional)
- revokedBy (UUID, FK → Person)
- revokedReason (text, optional)
- createdAt
- updatedAt

**Lifecycle:** PENDING → GRANTED | DENIED → REVOKED | EXPIRED

**Owner:** Guardian

**Critical Rule:** Child's interest prevails. Guardian consent may be revoked at any time.

---

#### 24. DataClassification
**Purpose:** Categorizes data sensitivity  
**Classification Levels:**
- PUBLIC: Publishable (name, position, team)
- INTERNAL: Club-only (contract terms, salary, performance analysis)
- CONFIDENTIAL: Leadership-only (financial metrics, strategic plans)
- SENSITIVE: Restricted (medical info, guardian contact)
- PROTECTED_MINOR: U-18 specific (photos require consent, DOB restricted)

**Mapping (Example):**
```
Person.firstName        → PUBLIC
Person.dateOfBirth      → SENSITIVE (PROTECTED_MINOR if age < 18)
Player.stats            → PUBLIC
Player.medicalNotes     → SENSITIVE
Staff.salary            → CONFIDENTIAL
Transaction.amount      → INTERNAL
GuardianConsent         → SENSITIVE (PROTECTED_MINOR)
```

---

## Aggregate Roots

Aggregates define consistency boundaries:

1. **Organization Aggregate**
   - Root: Organization
   - Children: OrganizationMembership, Season, Team, TrainingSession, Transaction
   - Invariant: Organization can only be modified by authorized roles

2. **Person Aggregate**
   - Root: Person
   - Children: FootballIdentity, GuardianConsent, Notification, NotificationPreference
   - Invariant: Person.dateOfBirth is immutable

3. **Team Aggregate**
   - Root: Team
   - Children: TeamMembership, Attendance
   - Invariant: Shirt numbers unique per team per season

4. **Match Aggregate**
   - Root: Match
   - Children: Fixture, Lineup, MatchEvent
   - Invariant: Completed matches cannot have score changed

5. **Season Aggregate**
   - Root: Season
   - Children: All season-scoped entities (Team, Standing, Competition Season)
   - Invariant: Season is immutable after status = CLOSED

---

## Key Relationships

### Cardinality Examples

**Person → FootballIdentity**: 1 → 1  
**FootballIdentity → OrganizationMembership**: 1 → Many  
**Organization → OrganizationMembership**: 1 → Many  
**Team → TeamMembership**: 1 → Many  
**Match → MatchEvent**: 1 → Many  
**Season → Competition Season**: 1 → Many  
**Match → Lineup**: 1 → 2 (home + away teams)  

---

## Temporal Boundaries

- **Season** defines training, match, and stat scope
- **TrainingSession** repeats weekly (template + occurrenceDate)
- **Membership** has temporal bounds (started_at, ended_at)
- **Match** has four timestamps: scheduled, started, completed
- **GuardianConsent** has expiration and revocation

---

## Status Enums (Canonical List)

| Entity | Statuses |
|---|---|
| Organization | ACTIVE, INACTIVE, SUSPENDED |
| OrganizationMembership | ACTIVE, ON_LEAVE, SUSPENDED, TERMINATED |
| Person | (lifecycle managed implicitly) |
| FootballIdentity | ACTIVE, SUSPENDED, RETIRED, TRANSFERRED |
| Season | PLANNED, ACTIVE, CLOSED, ARCHIVED |
| Team | ACTIVE, INACTIVE, SUSPENDED |
| TrainingSession | SCHEDULED, RESCHEDULED, CANCELLED, COMPLETED |
| Attendance | PRESENT, ABSENT, EXCUSED, SICK, LATE, INCOMPLETE |
| Match | SCHEDULED, LIVE, COMPLETED, ABANDONED, CANCELLED |
| Lineup | DRAFT, SUBMITTED, APPROVED, REJECTED, CHANGED |
| Transaction | PENDING, RECORDED, VERIFIED, RECONCILED, VOIDED |
| Notification | PENDING, DELIVERED, FAILED, READ, ARCHIVED |
| GuardianConsent | PENDING, GRANTED, DENIED, REVOKED, EXPIRED |

---

## Consistency Rules

1. **Football ID Immutability:** football_id never changes
2. **Match Completion Invariant:** homeScore and awayScore non-null only when status = COMPLETED
3. **Membership Temporal Integrity:** ended_at >= started_at
4. **Unique Shirt Numbers:** Unique per team per season
5. **Season Boundary:** All stats, memberships, training scoped to season
6. **Guardian Consent Required:** U-18 player data access requires valid consent

---

## Cross-Context Dependencies

```
Frontend Route → Domain Capability → Bounded Context → Entities

/pemain            → CAP-ORG-004      → Team Context           → Player, TeamMembership, Team
/pemain/$id        → CAP-ID-001       → Identity Context       → Person, FootballIdentity, PlayerStats
/latihan           → CAP-TRN-001      → Training Context       → TrainingSession, Attendance
/kompetisi         → CAP-CMP-001      → Competition Context    → Competition, CompetitionSeason, Match
/kompetisi/$id     → CAP-CMP-002      → Competition Context    → Match, Lineup, MatchEvent
/keuangan          → CAP-FIN-001      → Finance Context        → Transaction
/pengaturan        → CAP-ORG-002      → Organization Context   → Organization, OrganizationMembership
```

---

## Unresolved Dependencies

| Question | Impact | Status |
|---|---|---|
| Q1 Football ID Authority | Issuer determination | IN_REVIEW |
| Q2 Multi-tenancy | Shared DB vs. schema isolation | IN_REVIEW |
| Q3 Authorization Granularity | RBAC vs. ABAC | IN_REVIEW |
| Q4 Season Definition | Calendaric boundaries | IN_REVIEW |
| Q6 Attendance Semantics | Status meanings | IN_REVIEW |
| Q9 Safeguarding | Guardian rights, data protection | IN_REVIEW |

**Blocking:** None of these are blocking the contract specification. They will block implementation.

---

## Next Steps

1. Review domain model for consistency
2. Resolve Q1-Q12 governance questions
3. Proceed to API contract design
4. Create OpenAPI specification
5. Design persistence layer
