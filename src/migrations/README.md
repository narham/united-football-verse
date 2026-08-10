# Database Migrations - STEP 4: Authentication + Organization Membership

## Overview

This folder contains SQL migrations for STEP 4 implementation: Authentication + Organization Membership + RBAC + Organization Context.

These migrations create two core tables and enforce Row-Level Security (RLS) policies.

## Tables

### 1. user_profiles (Migration 001)

Extends Supabase Auth with user profile information.

**Key Columns:**
- `id` (UUID): Primary key
- `auth_user_id` (UUID): Foreign key to auth.users - links to authenticated user
- `display_name` (TEXT): User's display name
- `email` (TEXT): User's email
- `phone` (TEXT): Optional phone number
- `avatar_url` (TEXT): Optional avatar URL
- `status` (TEXT): Account status (ACTIVE, SUSPENDED, DELETED)
- `created_at`, `updated_at` (TIMESTAMP): Audit timestamps

**Constraints:**
- Unique constraint on `auth_user_id` (1:1 relationship with auth users)
- Indexes on auth_user_id, email, status for query performance

**RLS Policies:**
- Users can view their own profile
- Users can update their own profile
- Profiles cannot be directly inserted or deleted by users

### 2. organization_memberships (Migration 002)

Links users to organizations with roles and permission levels.

**Key Columns:**
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to user_profiles
- `organization_id` (UUID): Organization identifier (references future organizations table)
- `role` (TEXT): User role in organization (PLATFORM_ADMIN, ORG_OWNER, ORG_ADMIN, MANAGER, COACH, STAFF, FINANCE, VIEWER)
- `status` (TEXT): Membership status (ACTIVE, INVITED, SUSPENDED, REVOKED)
- `joined_at` (TIMESTAMP): When user joined
- `created_at`, `updated_at` (TIMESTAMP): Audit timestamps

**Constraints:**
- Unique constraint on (user_id, organization_id) - one membership per org per user
- Indexes on user_id, organization_id, status for query performance

**RLS Policies:**
- Users can view their own memberships
- Organization owners/admins can view all members in their orgs
- Users can only update their own membership (with restrictions)
- Organization owners/admins can update member roles
- No direct inserts or deletes allowed (use service role for these operations)

## RLS Security Model (Migration 003)

### Principle
"Deny by default, allow by explicit policy"

All queries go through Row-Level Security filters:

**For user_profiles:**
- SELECT: Only user can see their own profile
- UPDATE: User can only modify their own profile
- INSERT/DELETE: Disabled for users (only service role can do this)

**For organization_memberships:**
- SELECT: User sees own memberships + memberships of orgs where they're owner/admin
- UPDATE: Limited (users cannot escalate roles)
- INSERT/DELETE: Disabled for users (only service role can create/delete)

### Frontend Security

The frontend code provides additional guards:
1. **AuthContext**: Manages authentication state
2. **OrganizationContext**: Manages membership queries and organization context
3. **ProtectedRoute**: Redirects unauthenticated users to /login
4. **Repository pattern**: Validates membership before granting access to organization data

### Backend (Service Role)

Operations that require elevated privileges use the service role with full permissions:
- Creating user profiles during sign-up
- Inviting users to organizations
- Admin operations on behalf of system
- Deleting users (soft delete via status)

## How to Apply Migrations

### Using Supabase CLI

```bash
# Run a single migration
supabase migration create --sql < src/migrations/001_create_user_profiles.sql

# Run all migrations (auto-detects from folder)
supabase db push
```

### Using Supabase Dashboard

1. Go to SQL Editor
2. Copy contents of each migration file
3. Run in order: 001, 002, 003
4. Verify tables exist in Table Editor

### Using Direct SQL

Connect to your Supabase database and run each migration file in order.

## Verification

After applying migrations, verify:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'organization_memberships');

-- Check indexes exist
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'organization_memberships');

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'organization_memberships');

-- Check policies exist
SELECT schemaname, tablename, policyname FROM pg_policies 
WHERE schemaname = 'public';
```

## Demo Data

To test with demo data, insert test profiles and memberships:

```sql
-- Create demo user profile
INSERT INTO user_profiles (
  auth_user_id, 
  display_name, 
  email, 
  phone, 
  status
) VALUES (
  'auth-user-id-here',
  'Demo User',
  'demo@bolaid.id',
  '+62812345678',
  'ACTIVE'
);

-- Create demo membership
INSERT INTO organization_memberships (
  user_id,
  organization_id,
  role,
  status
) VALUES (
  (SELECT id FROM user_profiles WHERE email = 'demo@bolaid.id'),
  'org-id-here',
  'ORG_OWNER',
  'ACTIVE'
);
```

## Notes for Developers

- These migrations are independent of the frontend code
- The frontend uses the Repository pattern to abstract database access
- Demo mode uses localStorage and doesn't require these tables
- Supabase mode uses these tables with RLS enforcing security
- All timestamps are in UTC with timezone info
- The organization_id is a UUID but references a yet-to-be-defined organizations table
- RLS policies prevent data leakage and enforce authorization at the database level

## Future Migrations

These migrations are foundational for:
- STEP 5: Organizations table + management
- STEP 6: Permissions and advanced RBAC
- STEP 7: Audit logging and compliance
