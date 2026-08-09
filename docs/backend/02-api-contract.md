# Backend API Contract — bolaID Football OS v1.0

**Status:** SPECIFICATION ONLY — No Implementation  
**Date:** 2026-08-09  
**Base URL:** `/api/v1` (HTTP REST)  
**Format:** JSON Request/Response  
**Versioning:** `/api/v1` (breaking changes trigger `/api/v2`)

---

## API Design Principles

1. **Resource-Oriented:** Resources (players, matches, transactions) are primary
2. **Organization-Scoped:** All endpoints include organization context (tenant isolation)
3. **Role-Based Access:** Authorization per permission model (Q3 pending)
4. **Pagination Standard:** cursor-based or offset/limit (Q23 pending)
5. **Idempotency:** Commands use Idempotency-Key where required
6. **Consistency:** Standard error envelope for all failures
7. **Documentation:** OpenAPI 3.0 specification (separate artifact)

---

## Authentication & Authorization

### Authentication
**Method:** TBA (Q3 decision)  
**Placeholder:** Bearer token (JWT or Supabase session)

```
Authorization: Bearer <token>
```

### Authorization
**Model:** Role-Based Access Control (RBAC) with organization scope  
**Standard Permissions:**
```
organization:players:read
organization:players:write
organization:training:read
organization:training:write
organization:competition:read
organization:competition:write
organization:finance:read
organization:finance:write
organization:staff:read
organization:staff:write
```

**Enforcement:** At endpoint level + RLS (data-level)

---

## Common Request/Response Patterns

### Standard Success Response
```json
{
  "data": { /* entity */ },
  "meta": {
    "timestamp": "2026-08-09T10:30:00Z",
    "version": "1.0"
  }
}
```

### Paginated Response
```json
{
  "data": [ /* array of entities */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasNext": true,
    "hasPrev": false,
    "cursor": "next_cursor_token" /* if cursor-based */
  },
  "meta": { /* standard */ }
}
```

### Error Response
See 03-api-error-contract.md

---

## Endpoint Categories

### 1. Organization Management

#### GET /organizations
**Purpose:** List organizations user belongs to  
**Authentication:** Required  
**Authorization:** Own organizations only  
**Query Parameters:**
- `status` (enum: ACTIVE | INACTIVE | SUSPENDED)
- `type` (enum: SSB | ACADEMY | CLUB)
- `limit` (int, default: 20, max: 100)
- `page` (int, default: 1)

**Response:** 200 OK with organization list

**Example:**
```bash
GET /api/v1/organizations?status=ACTIVE&type=SSB
Authorization: Bearer token
```

---

#### GET /organizations/{organizationId}
**Purpose:** Retrieve single organization  
**Authentication:** Required  
**Authorization:** organization:read (must belong to org)  
**Path Parameters:**
- `organizationId` (UUID)

**Response:** 200 OK or 404 NOT_FOUND or 403 FORBIDDEN

---

#### PATCH /organizations/{organizationId}
**Purpose:** Update organization profile  
**Authentication:** Required  
**Authorization:** organization:write (ADMIN role)  
**Path Parameters:**
- `organizationId` (UUID)

**Request Body:**
```json
{
  "name": "SSB Garuda Muda",
  "short": "GRD",
  "city": "Bandung",
  "foundedYear": 2010
}
```

**Response:** 200 OK (updated org) or 400 BAD_REQUEST or 403 FORBIDDEN

**Idempotency:** Not required (PATCH is inherently idempotent)

---

### 2. Player Management

#### GET /organizations/{organizationId}/players
**Purpose:** List players in organization  
**Authentication:** Required  
**Authorization:** organization:players:read  
**Path Parameters:**
- `organizationId` (UUID)

**Query Parameters:**
- `season_id` (UUID, optional)
- `team_id` (UUID, optional)
- `position` (enum: GK | DF | MF | FW, optional)
- `status` (enum: ACTIVE | RESERVE | INJURED | ON_LOAN | TRANSFERRED, optional)
- `search` (text, matches name or football_id)
- `limit` (int, default: 20)
- `page` (int, default: 1)

**Response:** 200 OK with player list

**Example:**
```bash
GET /api/v1/organizations/club-garuda/players?position=GK&status=ACTIVE
```

---

#### GET /organizations/{organizationId}/players/{playerId}
**Purpose:** Retrieve player profile with stats  
**Authentication:** Required  
**Authorization:** organization:players:read + safeguarding check (Q9)  
**Path Parameters:**
- `organizationId` (UUID)
- `playerId` (UUID or football_id)

**Response:** 200 OK with player details or 404 NOT_FOUND or 403 FORBIDDEN (safeguarding)

**Response Schema:**
```json
{
  "data": {
    "id": "uuid",
    "football_id": "FID-2024-001",
    "name": "Bayu Setiawan",
    "dateOfBirth": "2008-03-15",
    "position": "DF",
    "shirtNumber": 2,
    "status": "ACTIVE",
    "stats": [
      {
        "season": "2026/2027",
        "apps": 12,
        "goals": 0,
        "assists": 2,
        "minutes": 900
      }
    ]
  }
}
```

---

#### POST /organizations/{organizationId}/players
**Purpose:** Register new player  
**Authentication:** Required  
**Authorization:** organization:players:write (ADMIN/MANAGER role)  
**Path Parameters:**
- `organizationId` (UUID)

**Request Body:**
```json
{
  "football_id": "FID-2024-001",
  "firstName": "Bayu",
  "lastName": "Setiawan",
  "dateOfBirth": "2008-03-15",
  "position": "DF",
  "shirtNumber": 2,
  "height": 175,
  "weight": 70,
  "preferredFoot": "RIGHT",
  "city": "Bandung"
}
```

**Response:** 201 CREATED with player details or 400 BAD_REQUEST or 409 CONFLICT (duplicate football_id)

**Idempotency:** Required for duplicate prevention
```
Idempotency-Key: {uuid-v7}
```

---

#### PATCH /organizations/{organizationId}/players/{playerId}
**Purpose:** Update player profile  
**Authentication:** Required  
**Authorization:** organization:players:write  
**Path Parameters:**
- `organizationId` (UUID)
- `playerId` (UUID)

**Request Body:** Subset of creation fields (partial update)

**Response:** 200 OK or 400 BAD_REQUEST or 404 NOT_FOUND or 403 FORBIDDEN

---

### 3. Training Management

#### GET /organizations/{organizationId}/training-sessions
**Purpose:** List training sessions  
**Authentication:** Required  
**Authorization:** organization:training:read  
**Path Parameters:**
- `organizationId` (UUID)

**Query Parameters:**
- `season_id` (UUID, optional)
- `team_id` (UUID, optional)
- `from_date` (YYYY-MM-DD, optional)
- `to_date` (YYYY-MM-DD, optional)
- `day_of_week` (enum: MONDAY | TUESDAY | ...)

**Response:** 200 OK with training session list

---

#### POST /organizations/{organizationId}/training-sessions
**Purpose:** Create training session  
**Authentication:** Required  
**Authorization:** organization:training:write (COACH/ADMIN)  
**Path Parameters:**
- `organizationId` (UUID)

**Request Body:**
```json
{
  "season_id": "uuid",
  "team_id": "uuid",
  "title": "Ball Control Drills",
  "dayOfWeek": "MONDAY",
  "startTime": "16:00",
  "endTime": "17:30",
  "location": "Lapangan A",
  "focus": "Passing,Conditioning"
}
```

**Response:** 201 CREATED or 400 BAD_REQUEST

---

#### POST /organizations/{organizationId}/training-sessions/{sessionId}/attendance
**Purpose:** Record player attendance  
**Authentication:** Required  
**Authorization:** organization:training:write  
**Path Parameters:**
- `organizationId` (UUID)
- `sessionId` (UUID)

**Request Body:**
```json
{
  "occurrence_date": "2026-08-09",
  "attendance_records": [
    {
      "football_id": "FID-2024-001",
      "status": "PRESENT",
      "checkInTime": "15:50"
    },
    {
      "football_id": "FID-2024-002",
      "status": "EXCUSED",
      "reason": "Medical appointment"
    }
  ]
}
```

**Response:** 201 CREATED or 400 BAD_REQUEST or 404 NOT_FOUND

**Idempotency:** Required
```
Idempotency-Key: {uuid-v7}
```

---

### 4. Competition & Match Management

#### GET /organizations/{organizationId}/competitions
**Purpose:** List competitions  
**Authentication:** Required  
**Authorization:** organization:competition:read  
**Query Parameters:**
- `season_code` (text, optional)
- `status` (enum: REGISTRATION | ACTIVE | CLOSED)
- `limit`, `page`

**Response:** 200 OK with competition list

---

#### GET /competitions/{competitionId}
**Purpose:** Retrieve competition details  
**Authentication:** Required  
**Authorization:** Public read (or org-scoped if private)  

**Response:** 200 OK or 404 NOT_FOUND

---

#### GET /competitions/{competitionId}/matches
**Purpose:** List matches in competition  
**Authentication:** Required  
**Query Parameters:**
- `competition_season_id` (UUID, optional)
- `team_id` (UUID, optional)
- `status` (enum: SCHEDULED | LIVE | COMPLETED)
- `from_date`, `to_date` (YYYY-MM-DD range filter)

**Response:** 200 OK with match list

---

#### GET /matches/{matchId}
**Purpose:** Retrieve match details  
**Authentication:** Required  
**Authorization:** Match visibility (Q27 TBD)  

**Response Schema:**
```json
{
  "data": {
    "id": "uuid",
    "competitionSeason": { /* ref */ },
    "homeTeam": { /* ref */ },
    "awayTeam": { /* ref */ },
    "scheduledDate": "2026-08-15T16:00:00Z",
    "venue": "Stadion Persib",
    "homeScore": null,
    "awayScore": null,
    "status": "SCHEDULED",
    "lineup": null,
    "events": []
  }
}
```

**Response:** 200 OK or 404 NOT_FOUND

---

#### PATCH /matches/{matchId}
**Purpose:** Update match (reschedule, record result)  
**Authentication:** Required  
**Authorization:** organization:competition:write (ORGANIZER)  
**Path Parameters:**
- `matchId` (UUID)

**Request Body (Partial):**
```json
{
  "homeScore": 2,
  "awayScore": 1,
  "status": "COMPLETED"
}
```

**Validation Rules:**
- homeScore and awayScore must be non-null if status = COMPLETED
- Status transitions must be legal (Q13 lifecycle)
- Match cannot be modified after completion (completed_at is set)

**Response:** 200 OK or 400 BAD_REQUEST or 409 CONFLICT

**Idempotency:** For result submission
```
Idempotency-Key: {match-id}-result-{timestamp}
```

---

#### POST /matches/{matchId}/lineup
**Purpose:** Submit team lineup  
**Authentication:** Required  
**Authorization:** organization:competition:write (coach)  
**Path Parameters:**
- `matchId` (UUID)

**Request Body:**
```json
{
  "team_id": "uuid",
  "formation": "4-3-3",
  "players": [
    {
      "football_id": "FID-001",
      "position": "GK",
      "shirtNumber": 1,
      "role": "STARTER"
    }
  ]
}
```

**Response:** 201 CREATED or 400 BAD_REQUEST or 409 CONFLICT (duplicate lineup submission)

**Idempotency:** Required
```
Idempotency-Key: {uuid}
```

---

#### POST /matches/{matchId}/events
**Purpose:** Record match event  
**Authentication:** Required  
**Authorization:** organization:competition:write (match official)  
**Path Parameters:**
- `matchId` (UUID)

**Request Body:**
```json
{
  "minute": 45,
  "eventType": "GOAL",
  "player_id": "uuid",
  "team_id": "uuid",
  "metadata": {
    "scorer": "Bayu Setiawan",
    "assist_by": "Roni Pranoto"
  }
}
```

**Validation:** Match must be status = LIVE

**Response:** 201 CREATED or 400 BAD_REQUEST or 409 CONFLICT

**Immutability Rule:** No modifications after match completion

---

### 5. Finance Management

#### GET /organizations/{organizationId}/transactions
**Purpose:** List transactions  
**Authentication:** Required  
**Authorization:** organization:finance:read  
**Query Parameters:**
- `type` (enum: INCOME | EXPENSE)
- `category` (enum: SPP | REGISTRATION | TOURNAMENT | EQUIPMENT | OPERATIONAL | OTHER)
- `from_date`, `to_date` (YYYY-MM-DD range)
- `limit`, `page`

**Response:** 200 OK with transaction list

---

#### POST /organizations/{organizationId}/transactions
**Purpose:** Create transaction  
**Authentication:** Required  
**Authorization:** organization:finance:write (MANAGER)  
**Path Parameters:**
- `organizationId` (UUID)

**Request Body:**
```json
{
  "date": "2026-08-09",
  "type": "INCOME",
  "category": "SPP",
  "amount": 1500000,
  "currency": "IDR",
  "description": "SPP Agustus - Bayu Setiawan",
  "reference": "INVOICE-001"
}
```

**Validation:**
- amount must be positive integer (minor units)
- type and category must be valid enums
- date must not be in future

**Response:** 201 CREATED or 400 BAD_REQUEST

**Idempotency:** Required
```
Idempotency-Key: {uuid}
```

---

#### GET /organizations/{organizationId}/transactions/{transactionId}
**Purpose:** Retrieve single transaction  
**Authentication:** Required  
**Authorization:** organization:finance:read  

**Response:** 200 OK or 404 NOT_FOUND

---

#### PATCH /organizations/{organizationId}/transactions/{transactionId}
**Purpose:** Update transaction  
**Authentication:** Required  
**Authorization:** organization:finance:write  

**Request Body (Partial):** Only certain fields updatable (description, status)

**Immutability Rule:** amount and date cannot be changed after creation (prevents audit trail tampering)

**Response:** 200 OK or 400 BAD_REQUEST or 403 FORBIDDEN

---

### 6. Notification Management

#### GET /users/{userId}/notifications
**Purpose:** List user's notifications  
**Authentication:** Required  
**Authorization:** Own notifications only  

**Query Parameters:**
- `status` (enum: PENDING | DELIVERED | FAILED | READ | ARCHIVED)
- `type` (enum: TRAINING | MATCH | FINANCE | SYSTEM)
- `limit`, `page`

**Response:** 200 OK with notification list

---

#### PATCH /notifications/{notificationId}
**Purpose:** Mark notification as read  
**Authentication:** Required  
**Authorization:** Own notification only  

**Request Body:**
```json
{
  "status": "READ"
}
```

**Response:** 200 OK or 404 NOT_FOUND

---

### 7. Safeguarding (Q9-Dependent)

#### GET /organizations/{organizationId}/players/{playerId}/consents
**Purpose:** List player consents (if U-18)  
**Authentication:** Required  
**Authorization:** organization:safeguarding:read (ADMIN/MANAGER)  

**Response:** 200 OK with consent records or 404 if player not found

---

#### POST /organizations/{organizationId}/players/{playerId}/consents
**Purpose:** Request guardian consent (demonstration only)  
**Authentication:** Required  
**Authorization:** organization:safeguarding:write (ADMIN)  

**Request Body:**
```json
{
  "consentType": "PHOTO",
  "purpose": "Team roster publication",
  "expiresAt": "2027-08-09"
}
```

**Response:** 201 CREATED or 400 BAD_REQUEST (if player is adult)

**Rule:** Only for U-18 players; guardian must grant before sensitive data is shared

---

## Query Parameter Standards

| Parameter | Type | Default | Max | Notes |
|---|---|---|---|---|
| `limit` | int | 20 | 100 | Page size |
| `page` | int | 1 | — | Offset page |
| `cursor` | string | null | — | Cursor-based pagination (if applicable) |
| `sort` | string | created_at | — | `sort=-created_at` for descending |
| `search` | string | null | — | Full-text search (if applicable) |
| `from_date` | date | null | — | ISO 8601 YYYY-MM-DD |
| `to_date` | date | null | — | ISO 8601 YYYY-MM-DD |

---

## Rate Limiting (Provisional)

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1660000000
```

**Limits (Provisional — Q42 TBD):**
- Read endpoints: 100 req/min per user
- Write endpoints: 20 req/min per user
- Bulk operations: 5 req/min per user

**429 Too Many Requests:** Retry-After header included

---

## Concurrency & ETags (Q26 Dependent)

**Optional ETag support for conflict prevention:**
```
ETag: "1b2cf7c5d9f8a2e4"
If-Match: "1b2cf7c5d9f8a2e4"
```

**409 Conflict:** Returned if ETag mismatch (resource changed by another user)

---

## Audit & Logging Requirements

Every endpoint must support audit logging:
- `X-Correlation-ID` header (provided by client or generated by API)
- `X-Request-ID` header (internal request tracking)
- Audit trail recorded for: CREATE, UPDATE, DELETE, EXPORT

---

## Next Phases

1. **OpenAPI 3.0 Specification** (separate artifact)
2. **Error Contract Details** (see 03-api-error-contract.md)
3. **Repository Interfaces** (see 36-repository-contract.md)
4. **Implementation in Supabase RPC/PostgreSQL Functions**
