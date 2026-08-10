-- Migration: Create training_sessions and attendance tables
-- Purpose: Track training schedules and player attendance
-- PHASE 6 STEP 5.6-5.7
-- Date: 2026-08-09
--
-- Business Model:
-- - TrainingSession = recurring training schedule (e.g., "Monday 15:00-17:00")
-- - Attendance = records actual attendance for a specific training date

CREATE TABLE IF NOT EXISTS public.training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-Tenancy (RLS isolation key)
  organization_id UUID NOT NULL,
  
  -- Foreign Keys
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  
  -- Session Information
  title TEXT NOT NULL,                    -- e.g., "Fisik & Stamina"
  day_of_week TEXT NOT NULL,              -- e.g., "Senin", "Monday"
  start_time TIME NOT NULL,               -- e.g., "15:00"
  end_time TIME NOT NULL,                 -- e.g., "17:00"
  location TEXT,                          -- e.g., "Lapangan A"
  focus TEXT,                             -- e.g., "Teknik & Passing"
  
  -- Status
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT title_not_empty CHECK (LENGTH(title) > 0),
  CONSTRAINT time_order CHECK (end_time > start_time)
);

-- Indexes
CREATE INDEX idx_training_organization_id ON public.training_sessions (organization_id);
CREATE INDEX idx_training_team_id ON public.training_sessions (team_id);
CREATE INDEX idx_training_day ON public.training_sessions (day_of_week);

-- Enable RLS
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Attendance Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-Tenancy (RLS isolation key)
  organization_id UUID NOT NULL,
  
  -- Foreign Keys
  training_id UUID NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  
  -- Attendance Status
  status TEXT NOT NULL CHECK (status IN (
    'PRESENT',
    'ABSENT_SICK',
    'ABSENT_PERMISSION',
    'ABSENT_UNEXCUSED',
    'LATE'
  )),
  
  -- Date (specific date of this training instance)
  date DATE NOT NULL,                     -- YYYY-MM-DD
  
  -- Timestamps
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_attendance UNIQUE (training_id, player_id, date)
);

-- Indexes
CREATE INDEX idx_attendance_organization_id ON public.attendance (organization_id);
CREATE INDEX idx_attendance_training_id ON public.attendance (training_id);
CREATE INDEX idx_attendance_player_id ON public.attendance (player_id);
CREATE INDEX idx_attendance_date ON public.attendance (date);
CREATE INDEX idx_attendance_status ON public.attendance (status);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for training_sessions
-- ============================================================================

CREATE POLICY "Users can view training from their organizations" ON public.training_sessions
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

CREATE POLICY "Coaches can create training" ON public.training_sessions
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'COACH', 'STAFF')
      AND status = 'ACTIVE'
    )
  );

CREATE POLICY "Coaches can update training" ON public.training_sessions
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'COACH', 'STAFF')
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
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'COACH', 'STAFF')
      AND status = 'ACTIVE'
    )
  );

CREATE POLICY "Admins can delete training" ON public.training_sessions
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
-- RLS Policies for attendance
-- ============================================================================

CREATE POLICY "Users can view attendance from their organizations" ON public.attendance
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

CREATE POLICY "Coaches can record attendance" ON public.attendance
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'COACH', 'STAFF')
      AND status = 'ACTIVE'
    )
  );

CREATE POLICY "Coaches can update attendance" ON public.attendance
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT DISTINCT organization_id FROM public.organization_memberships
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE auth_user_id = auth.uid()
      )
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'COACH', 'STAFF')
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
      AND role IN ('ORG_OWNER', 'ORG_ADMIN', 'MANAGER', 'COACH', 'STAFF')
      AND status = 'ACTIVE'
    )
  );

CREATE POLICY "Admins can delete attendance" ON public.attendance
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

GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL PRIVILEGES ON public.training_sessions TO service_role;
GRANT ALL PRIVILEGES ON public.attendance TO service_role;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.training_sessions IS 'Training schedules (recurring pattern)';
COMMENT ON COLUMN public.training_sessions.organization_id IS 'Multi-tenancy isolation key';
COMMENT ON TABLE public.attendance IS 'Player attendance records for specific training dates';
COMMENT ON COLUMN public.attendance.organization_id IS 'Multi-tenancy isolation key';
COMMENT ON COLUMN public.attendance.date IS 'Specific date of training instance';
COMMENT ON CONSTRAINT unique_attendance ON public.attendance
  IS 'Each player can have only one attendance record per training per date';
