-- RBAC DECISION: FINANCE role is INTENTIONALLY EXCLUDED from staff INSERT/UPDATE/DELETE (staff mgmt = HR/ops, not finance — separation of duties; see rbac-matrix.json)
-- Migration: Create staff table
-- Purpose: Store coaching and administrative staff members
-- PHASE 6 STEP 5.5
-- Date: 2026-08-09
--
-- Business Model:
-- - Staff represents coaches, physios, managers, operators
-- - Staff are scoped to organization
-- - Roles: HEAD_COACH, ASSISTANT_COACH, GK_COACH, PHYSIO, MANAGER, OPERATOR

CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-Tenancy (RLS isolation key)
  organization_id UUID NOT NULL,
  
  -- Staff Information
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN (
    'HEAD_COACH',
    'ASSISTANT_COACH',
    'GK_COACH',
    'PHYSIO',
    'MANAGER',
    'OPERATOR'
  )),
  telephone TEXT,
  email TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT name_not_empty CHECK (LENGTH(name) > 0)
);

-- Indexes
CREATE INDEX idx_staff_organization_id ON public.staff (organization_id);
CREATE INDEX idx_staff_role ON public.staff (role);
CREATE INDEX idx_staff_status ON public.staff (status);

-- Enable RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for staff
-- ============================================================================

CREATE POLICY "Users can view staff from their organizations" ON public.staff
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

CREATE POLICY "Org admins can create staff" ON public.staff
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER')
      AND status = 'ACTIVE'
    )
  );

CREATE POLICY "Org admins can update staff" ON public.staff
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER')
      AND status = 'ACTIVE'
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER')
      AND status = 'ACTIVE'
    )
  );

CREATE POLICY "Org admins can delete staff" ON public.staff
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

-- ============================================================================
-- Permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff TO authenticated;
GRANT ALL PRIVILEGES ON public.staff TO service_role;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.staff IS 'Coaching and administrative staff members';
COMMENT ON COLUMN public.staff.organization_id IS 'Multi-tenancy isolation key';
COMMENT ON COLUMN public.staff.role IS 'Staff role/position in the organization';
