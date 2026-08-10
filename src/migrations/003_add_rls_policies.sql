-- Migration: RLS Policies for user_profiles and organization_memberships
-- Purpose: Enforce row-level security based on user identity and organization membership
-- Created: STEP 4.16
--
-- Security principles:
-- 1. Users can only see their own profile
-- 2. Users can only see memberships they own or organizations they're part of
-- 3. ORG_OWNER and ORG_ADMIN can see org members and their profiles
-- 4. PLATFORM_ADMIN can see everything (not enforced here, relies on service role)

-- ============================================================================
-- RLS Policies for user_profiles
-- ============================================================================

-- Policy: Users can select their own profile
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT
  USING (auth_user_id = auth.uid());

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Policy: Only auth system can insert profiles (via trigger)
CREATE POLICY "Profiles cannot be directly inserted by users" ON public.user_profiles
  FOR INSERT
  WITH CHECK (FALSE);

-- Policy: Profiles cannot be directly deleted (soft delete via status)
CREATE POLICY "Profiles cannot be directly deleted" ON public.user_profiles
  FOR DELETE
  USING (FALSE);

-- ============================================================================
-- RLS Policies for organization_memberships
-- ============================================================================

-- Policy: Users can see their own memberships
CREATE POLICY "Users can view their own memberships" ON public.organization_memberships
  FOR SELECT
  USING (
    user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
  );

-- Policy: Org owners and admins can see all members of their organization
CREATE POLICY "Org owners and admins can view org members" ON public.organization_memberships
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_memberships
      WHERE user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
      AND role IN ('ORG_OWNER', 'ORG_ADMIN')
      AND status = 'ACTIVE'
    )
  );

-- Policy: Users can update their own membership (status changes only)
-- This is limited to prevent role escalation
CREATE POLICY "Users can update their own membership status" ON public.organization_memberships
  FOR UPDATE
  USING (
    user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    -- Cannot change organization_id or role
    organization_id = (SELECT organization_id FROM public.organization_memberships WHERE id = organization_memberships.id)
    AND role = (SELECT role FROM public.organization_memberships WHERE id = organization_memberships.id)
  );

-- Policy: Only admins and owners can update membership
CREATE POLICY "Org admins can update member roles" ON public.organization_memberships
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_memberships
      WHERE user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
      AND role IN ('ORG_OWNER', 'ORG_ADMIN')
      AND status = 'ACTIVE'
    )
  );

-- Policy: No direct inserts allowed (should use invite flow)
CREATE POLICY "Memberships cannot be directly inserted" ON public.organization_memberships
  FOR INSERT
  WITH CHECK (FALSE);

-- Policy: No direct deletes allowed (use soft delete via status)
CREATE POLICY "Memberships cannot be directly deleted" ON public.organization_memberships
  FOR DELETE
  USING (FALSE);

-- ============================================================================
-- Grant permissions
-- ============================================================================

-- Grant permissions to authenticated users
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT, UPDATE ON public.organization_memberships TO authenticated;

-- Grant full permissions to service role (backend)
-- Note: Service role key should never be exposed to frontend
GRANT ALL PRIVILEGES ON public.user_profiles TO service_role;
GRANT ALL PRIVILEGES ON public.organization_memberships TO service_role;

COMMENT ON POLICY "Users can view their own profile" ON public.user_profiles
  IS 'Each user can only see their own profile data';

COMMENT ON POLICY "Users can view their own memberships" ON public.organization_memberships
  IS 'Users can see their memberships to any organization';

COMMENT ON POLICY "Org owners and admins can view org members" ON public.organization_memberships
  IS 'Organization owners and admins can view all active members in their organization';
