# PHASE 6 STEP 3 - Persistence Mapping
## Identity & Organization Backend Foundation

**Scope:** Map frontend domain models to Supabase PostgreSQL schema  
**Status:** STEP 3 - Defining persistence mapping  
**Reference:** requirements #39 (Implementation Order)

---

## Frontend Domain Model

### Core Entities

#### 1. Player (from demo-data.ts)
```typescript
interface Player {
  id: string;
  clubId: string;
  football_id: string;           // ⭐ STABLE reference (never changes)
  name: string;
  posisi: PlayerPosition;
  nomor: number;
  tanggalLahir: string;
  status: PlayerStatus;
  tinggi: number;
  berat: number;
  kaki: "Kiri" | "Kanan";
  citizenship?: "INDONESIAN" | "FOREIGN";  // ✨ NEW - added for identity support
  fotoUrl?: string;
  stats: SeasonStat[];
}
```

#### 2. IdentityDocument (from domain/identity/)
```typescript
interface IdentityDocument {
  id: string;
  playerId: string;               // Reference to player (person)
  documentType: "NIK" | "PASSPORT" | "KITAS";
  documentNumber: string;         // Full unmasked (PII - never in UI)
  issuingCountry: string;
  issuedAt?: string;
  expiresAt?: string;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED";
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  clubId: string;
}
```

#### 3. Club (from demo-data.ts)
```typescript
interface Club {
  id: string;
  name: string;
  short: string;
  city: string;
  foundedYear: number;
  season: string;
  sport: string;
  logoUrl?: string;
  footballOrgId?: string;
}
```

---

## Target Database Schema (PostgreSQL + Supabase)

### Enum Types
```sql
-- Existing enums (already in db-schema.md)
create type public.player_position as enum ('GK', 'DF', 'MF', 'FW');
create type public.player_status as enum ('aktif', 'cadangan', 'cedera');

-- New enums for identity
create type public.citizenship_type as enum ('INDONESIAN', 'FOREIGN');
create type public.document_type as enum ('NIK', 'PASSPORT', 'KITAS');
create type public.verification_status as enum ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');
```

### Tables

#### 1. clubs (already in db-schema.md, no changes)
```sql
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  short text not null default '',
  kota text,
  founded_year int,
  season text not null default '2026/2027',
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
```

#### 2. players (MODIFIED to add citizenship field)
```sql
create table public.players (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete cascade not null,
  football_id text unique,              -- ⭐ STABLE IDENTITY
  nama text not null,
  posisi player_position not null,
  nomor int,
  tgl_lahir date,
  status player_status not null default 'aktif',
  citizenship citizenship_type,         -- ✨ NEW: INDONESIAN | FOREIGN
  tinggi int,
  berat int,
  kaki text check (kaki in ('Kiri','Kanan')),
  foto_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

#### 3. identity_documents (NEW - Step 3)
```sql
create table public.identity_documents (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade not null,
  document_type document_type not null,
  document_number text not null,                  -- Full unmasked (PII)
  document_number_normalized text not null,       -- For comparison (uppercase/trimmed)
  issuing_country text not null,                  -- ISO code or country name
  issued_at date,                                 -- Optional
  expires_at date,                                -- Optional (required for KITAS)
  verification_status verification_status not null default 'UNVERIFIED',
  verified_at timestamptz,
  rejection_reason text,
  club_id uuid references public.clubs(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Uniqueness constraints
  unique (document_type, document_number_normalized) where document_type = 'NIK',
  unique (document_type, document_number_normalized, issuing_country) where document_type in ('PASSPORT', 'KITAS')
);

-- Indexes for query performance
create index idx_identity_documents_player_id on public.identity_documents(player_id);
create index idx_identity_documents_document_type on public.identity_documents(document_type);
create index idx_identity_documents_verification_status on public.identity_documents(verification_status);
create index idx_identity_documents_club_id on public.identity_documents(club_id);
```

#### 4. persons (PROVISIONAL - for future Football Identity module)
```sql
-- Will be implemented in Step 4+
-- Currently, Person is implicit as Player
-- Future structure:
-- Person (root aggregate for real-world human)
--   ├── Football Identity (stable DID-style identifier)
--   └── Identity Documents
```

#### 5. organization_memberships (PROVISIONAL - for Step 4)
```sql
-- Will be implemented in Step 4
-- Currently, Club membership is implicit
-- Future: person can be member of multiple clubs over time
```

---

## Mapping Rules

### Rule 1: Football ID is Stable (§6 - FOOTBALL IDENTITY RULE)
- Football ID is NOT: NIK, Passport, KITAS, user_id, club_id, player_id
- Football ID must survive: club transfer, team transfer, season change
- **Mapping:** Store in `players.football_id` as immutable field
- **RLS:** No policy change needed (clubs already scoped by owner)

### Rule 2: Identity Document Numbers are PII
- **Storage:** `identity_documents.document_number` contains FULL unmasked number
- **Display:** Use IdentityDocumentDisplay DTO with masked number
- **Query:** Use `document_number_normalized` for lookups (normalized for case-insensitivity)
- **Logging:** Never log raw document_number

### Rule 3: Organization Isolation
- **Scope:** All identity documents must be scoped by club_id
- **RLS:** Even if person moves clubs, access controlled by club membership
- **Query:** Always filter by club_id in repository queries

### Rule 4: Citizenship Drives Document Type
```
INDONESIAN → NIK (exactly one, no expiration)
FOREIGN    → PASSPORT or KITAS (can have multiple, optional expiration)
```

### Rule 5: Duplicate Protection
- **NIK:** Unique at database level
  ```
  unique (document_type, document_number_normalized) 
  where document_type = 'NIK'
  ```
- **Passport/KITAS:** Unique per issuing country
  ```
  unique (document_type, document_number_normalized, issuing_country) 
  where document_type in ('PASSPORT', 'KITAS')
  ```

### Rule 6: Verification Status Transitions
```
UNVERIFIED  ─→ PENDING (manual verification)
PENDING     ─→ VERIFIED or REJECTED
VERIFIED    ─→ EXPIRED (if expires_at passed)
```
No automatic transitions in database. Manual update required.

### Rule 7: Demo Mode Must Continue
- Demo data remains in `src/lib/demo-data.ts`
- DemoRepository classes remain unchanged
- Supabase repository implementations side-by-side
- Factory method switches based on environment flag

---

## RLS (Row Level Security) Model

### Baseline Policy: Club Ownership
```sql
-- All organization-scoped tables:
-- identities, identity_documents, memberships

create policy "Club staff access identity data"
on public.identity_documents
for all to authenticated
using (
  exists (
    select 1 from public.clubs c
    where c.id = identity_documents.club_id
    and c.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.clubs c
    where c.id = identity_documents.club_id
    and c.owner_id = auth.uid()
  )
);
```

### Future Extension: Role-Based Access (Step 4)
```
admin: read + write all identity documents
pelatih: read + write for their team
manager: read only (audit trail)
pemain: read own identity documents only
```

---

## Frontend ↔ Backend Data Flow

### Create Player with NIK

```
UI Component (player-form.tsx)
  │
  ├─ Form submission with citizenship="INDONESIAN" + NIK
  │
  ▼
React Hook Form + Zod validation
  │
  ├─ Local validation: validateNIK()
  │
  ▼
TanStack Query Mutation
  │
  ├─ useCreatePlayer() hook
  ├─ useCreateIdentityDocument() hook
  │
  ▼
Repository Layer
  │
  ├─ DemoPlayerRepository.create()  (dev mode)
  ├─ SupabasePlayerRepository.create()  (production)
  │
  ├─ DemoIdentityDocumentRepository.create()  (dev mode)
  ├─ SupabaseIdentityDocumentRepository.create()  (production)
  │
  ▼
Storage
  │
  ├─ localStorage  (demo)
  ├─ PostgreSQL  (production)
```

### Query Player with Identity Documents

```
UI Component (player-identity-section.tsx)
  │
  ├─ usePlayer(id) hook
  ├─ useIdentityDocuments(playerId) hook
  │
  ▼
Repository Layer
  │
  ├─ PlayerRepository.getById(id)
  ├─ IdentityDocumentRepository.getByPlayerId(playerId)
  │
  ▼
Domain Service Layer
  │
  ├─ createDisplayModel(doc)  → IdentityDocumentDisplay (masked)
  │
  ▼
UI Display
  │
  ├─ Masked number only
  ├─ Never log full document_number
```

---

## Key Differences from Frontend Model

| Frontend | Database | Reason |
|----------|----------|--------|
| `playerId` | `player_id` (UUID) | Foreign key reference |
| `documentType` | `document_type` (enum) | PostgreSQL enum type |
| `documentNumber` | `document_number` (text) | Raw PII storage |
| - | `document_number_normalized` | Lookup index (case-insensitive) |
| `issuingCountry` | `issuing_country` (text) | PostgreSQL text |
| `verificationStatus` | `verification_status` (enum) | PostgreSQL enum type |
| `createdAt` | `created_at` (timestamptz) | Database timestamp |
| `updatedAt` | `updated_at` (timestamptz) | Database timestamp |

---

## Environment Configuration

### Browser-Safe (VITE_)
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Server-Only (.env)
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://user:password@localhost:5432/bolaid
```

### Never Commit
```
.env
.env.local
.env.*.local
*-credentials.json
service_role_key
```

---

## Success Criteria

- ✅ Mapping document created and reviewed
- ✅ All domain types mapped to database types
- ✅ Uniqueness constraints defined (NIK vs Passport/KITAS)
- ✅ Indexes planned for query performance
- ✅ RLS policy model documented
- ✅ PII protection rules specified
- ✅ Environment configuration defined
- ✅ No breaking changes to existing Player interface
- ✅ Demo mode isolation confirmed

---

## Next Steps

1. ✅ STEP 3: Define persistence mapping (THIS DOCUMENT)
2. ⏳ STEP 4: Configure Supabase client (src/lib/supabase/client.ts)
3. ⏳ STEP 5: Create database migration
4. ⏳ STEP 6-7: Implement RLS policies
5. ⏳ STEP 8: Implement Supabase repositories
6. ⏳ STEP 9-15: Integration, testing, verification
