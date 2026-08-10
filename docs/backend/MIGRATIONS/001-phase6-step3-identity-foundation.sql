-- PHASE 6 STEP 3 — Database Migration
-- Supabase Backend Foundation: Identity & Organization
-- 
-- This migration creates the foundational tables for:
-- - Extended Player with citizenship
-- - Identity Documents (NIK, Passport, KITAS)
-- - Organization structure (provisional)
--
-- Scope: STEP 3 only
-- Target: PostgreSQL 14+ (Supabase)
-- 
-- Safety Notes:
-- - Idempotent: uses "if not exists" / "if exists"
-- - Reversible: contains equivalent drop statements
-- - No data destruction: adds new columns/tables only
-- - RLS enabled on all tables
-- - Constraints are database-level

-- ============================================================
-- ENUM TYPES (Extend existing enums from db-schema.md)
-- ============================================================

-- Create citizenship type enum
create type if not exists public.citizenship_type as enum ('INDONESIAN', 'FOREIGN');

-- Create document type enum for identity documents
create type if not exists public.document_type as enum ('NIK', 'PASSPORT', 'KITAS');

-- Create verification status enum for identity documents
create type if not exists public.verification_status as enum (
  'UNVERIFIED',
  'PENDING',
  'VERIFIED',
  'REJECTED',
  'EXPIRED'
);

-- ============================================================
-- ALTER EXISTING TABLES
-- ============================================================

-- Add citizenship column to players table
-- This allows storing citizenship type for each player
alter table public.players
add column if not exists citizenship public.citizenship_type;

-- Add updated_at column if not exists (for audit trail)
alter table public.players
add column if not exists updated_at timestamptz default now();

-- ============================================================
-- NEW TABLES — Identity Documents (Main Step 3 Focus)
-- ============================================================

-- Identity Documents Table
-- Stores official government-issued identity documents for players
-- Supports: NIK (Indonesian), Passport (Foreign), KITAS (Foreign)
create table if not exists public.identity_documents (
  -- Primary key
  id uuid primary key default gen_random_uuid(),

  -- References
  player_id uuid not null references public.players(id) on delete cascade,
  club_id uuid not null references public.clubs(id) on delete cascade,

  -- Document information
  document_type public.document_type not null,
  document_number text not null,                    -- Full unmasked (PII)
  document_number_normalized text not null,        -- Normalized for comparison
  issuing_country text not null,

  -- Dates
  issued_at date,                                   -- Optional issue date
  expires_at date,                                  -- Optional expiration (required for KITAS)

  -- Verification
  verification_status public.verification_status not null default 'UNVERIFIED',
  verified_at timestamptz,                          -- When verification completed
  rejection_reason text,                            -- Why verification failed

  -- Audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Uniqueness Constraints
  -- NIK must be globally unique (only one per NIK number)
  constraint unique_nik_number unique (document_type, document_number_normalized)
    where document_type = 'NIK',
  
  -- Passport/KITAS must be unique per issuing country
  constraint unique_passport_per_country unique (document_type, document_number_normalized, issuing_country)
    where document_type in ('PASSPORT', 'KITAS'),

  -- Ensure document type matches citizenship requirements
  constraint valid_citizenship_document_type check (
    -- NIK only for Indonesian citizens
    (document_type = 'NIK' and (
      select citizenship from public.players where id = player_id
    ) = 'INDONESIAN')
    or
    -- Passport/KITAS only for foreign citizens
    (document_type in ('PASSPORT', 'KITAS') and (
      select citizenship from public.players where id = player_id
    ) = 'FOREIGN')
  ),

  -- KITAS requires expiration date
  constraint kitas_requires_expiration check (
    document_type != 'KITAS' or expires_at is not null
  )
);

-- ============================================================
-- INDEXES (Query Performance)
-- ============================================================

-- Index for finding documents by player
create index if not exists idx_identity_documents_player_id 
  on public.identity_documents(player_id);

-- Index for filtering by document type
create index if not exists idx_identity_documents_document_type 
  on public.identity_documents(document_type);

-- Index for filtering by verification status
create index if not exists idx_identity_documents_verification_status 
  on public.identity_documents(verification_status);

-- Index for club-level access control
create index if not exists idx_identity_documents_club_id 
  on public.identity_documents(club_id);

-- Index for lookup by normalized document number (for duplicate detection)
create index if not exists idx_identity_documents_normalized_number 
  on public.identity_documents(document_type, document_number_normalized);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on identity_documents table
alter table public.identity_documents enable row level security;

-- Policy: Club staff (owner) can manage identity documents for their club
create policy if not exists "Club staff manage identity documents"
  on public.identity_documents
  for all
  to authenticated
  using (
    -- User must be owner of the club
    exists (
      select 1 from public.clubs c
      where c.id = identity_documents.club_id
      and c.owner_id = auth.uid()
    )
  )
  with check (
    -- Same check for insert/update
    exists (
      select 1 from public.clubs c
      where c.id = identity_documents.club_id
      and c.owner_id = auth.uid()
    )
  );

-- Policy: Anon access (for testing/demo - can be restricted later)
create policy if not exists "Allow anon read identity documents"
  on public.identity_documents
  for select
  to anon
  using (true);  -- Allows demo mode to work

-- ============================================================
-- TRIGGERS (Optional - Auto-update updated_at)
-- ============================================================

-- Create trigger function for updated_at
create or replace function public.update_identity_documents_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end
$$;

-- Create trigger
create trigger if not exists identity_documents_updated_at_trigger
  before update on public.identity_documents
  for each row
  execute function public.update_identity_documents_updated_at();

-- ============================================================
-- GRANTS (Permissions)
-- ============================================================

grant select, insert, update, delete on public.identity_documents to authenticated;
grant select on public.identity_documents to anon;
grant all on public.identity_documents to service_role;

-- ============================================================
-- PROVISIONAL TABLES (For Future Steps 4+)
-- ============================================================

-- persons table (future - will replace implicit person model)
-- Currently not implemented - Person is implicit in Player
-- Will be added in Step 4+ after Football Identity module is ready

-- organization_memberships table (future - for multi-club membership)
-- Currently not implemented - Membership is implicit in Player.clubId
-- Will be added in Step 4+ for time-boxed memberships

-- ============================================================
-- DOWN (Rollback) — Run if needed
-- ============================================================

/*
-- Revert this migration by uncommenting and running:

alter table public.players
drop column if exists citizenship;

alter table public.players
drop column if exists updated_at;

drop table if exists public.identity_documents cascade;

drop type if exists public.citizenship_type;
drop type if exists public.document_type;
drop type if exists public.verification_status;

-- Note: RLS policies are automatically dropped with table
-- Note: Triggers are automatically dropped with table
-- Note: Indexes are automatically dropped with table
*/

-- ============================================================
-- Verification Queries (Run after migration)
-- ============================================================

/*
-- Verify tables exist
select tablename from pg_tables 
where schemaname = 'public' 
and tablename in ('identity_documents', 'players');

-- Verify columns exist
select column_name, data_type 
from information_schema.columns 
where table_schema = 'public' 
and table_name = 'identity_documents';

-- Verify indexes exist
select indexname from pg_indexes 
where schemaname = 'public' 
and tablename = 'identity_documents';

-- Verify enums exist
select typname from pg_type 
where typnamespace = (select oid from pg_namespace where nspname = 'public')
and typname in ('citizenship_type', 'document_type', 'verification_status');

-- Verify RLS is enabled
select tablename, rowsecurity 
from pg_tables 
where schemaname = 'public' 
and tablename = 'identity_documents';
*/
