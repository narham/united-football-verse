-- Migration: Create transactions table (Finance)
-- Purpose: Track income and expenses for the organization
-- PHASE 6 STEP 5.10
-- Date: 2026-08-09
--
-- Business Model:
-- - Transaction = income or expense record
-- - Categories: SPP (membership fees), REGISTRATION, EQUIPMENT, OPERATIONAL, TOURNAMENT, OTHER
-- - Scoped to organization for financial isolation
-- - Support for basic financial reporting

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-Tenancy (RLS isolation key)
  organization_id UUID NOT NULL,
  
  -- Transaction Information
  date DATE NOT NULL,                     -- YYYY-MM-DD
  type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
  amount INT NOT NULL,                    -- Amount in smallest unit (cents/rupiahs)
  
  -- Category
  category TEXT NOT NULL CHECK (category IN (
    'SPP',                                -- Membership fees
    'REGISTRATION',                       -- Player registration
    'EQUIPMENT',                          -- Uniforms, equipment purchase
    'OPERATIONAL',                        -- Field rental, utilities
    'TOURNAMENT',                         -- Tournament fees
    'OTHER'                               -- Miscellaneous
  )),
  
  -- Description
  description TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'RECORDED' CHECK (status IN ('RECORDED', 'VERIFIED', 'ARCHIVED')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT amount_positive CHECK (amount > 0)
);

-- Indexes
CREATE INDEX idx_transactions_organization_id ON public.transactions (organization_id);
CREATE INDEX idx_transactions_date ON public.transactions (date);
CREATE INDEX idx_transactions_type ON public.transactions (type);
CREATE INDEX idx_transactions_category ON public.transactions (category);
CREATE INDEX idx_transactions_status ON public.transactions (status);

-- Composite index for common queries (balance reports by date)
CREATE INDEX idx_transactions_org_date 
  ON public.transactions (organization_id, date);

-- Composite index for category reports
CREATE INDEX idx_transactions_org_category 
  ON public.transactions (organization_id, category);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for transactions
-- ============================================================================

CREATE POLICY "Users can view transactions from their organizations" ON public.transactions
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

-- Finance role and admins can create/update transactions
CREATE POLICY "Finance staff can create transactions" ON public.transactions
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'FINANCE', 'STAFF')
      AND status = 'ACTIVE'
    )
  );

CREATE POLICY "Finance staff can update transactions" ON public.transactions
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'FINANCE', 'STAFF')
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
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'FINANCE', 'STAFF')
      AND status = 'ACTIVE'
    )
  );

-- Only admins can delete
CREATE POLICY "Admins can delete transactions" ON public.transactions
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

GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL PRIVILEGES ON public.transactions TO service_role;

-- ============================================================================
-- Helper Function: Calculate Balance
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_organization_balance(org_id UUID)
RETURNS INT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(SUM(
    CASE 
      WHEN type = 'INCOME' THEN amount
      WHEN type = 'EXPENSE' THEN -amount
      ELSE 0
    END
  ), 0)
  FROM public.transactions
  WHERE organization_id = org_id
  AND status IN ('RECORDED', 'VERIFIED');
$$;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.transactions IS 'Financial transactions (income/expenses) per organization';
COMMENT ON COLUMN public.transactions.organization_id IS 'Multi-tenancy isolation key';
COMMENT ON COLUMN public.transactions.amount IS 'Amount in smallest currency unit (positive value only)';
COMMENT ON COLUMN public.transactions.type IS 'INCOME or EXPENSE (sign applied by type, not amount)';
COMMENT ON FUNCTION public.get_organization_balance(UUID) IS 'Calculate current balance for organization';
COMMENT ON POLICY "Users can view transactions from their organizations" ON public.transactions
  IS 'Members can only see transactions from their organizations';
COMMENT ON POLICY "Finance staff can create transactions" ON public.transactions
  IS 'Finance role and org admins can record new transactions';
