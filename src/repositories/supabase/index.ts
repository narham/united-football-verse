/**
 * Supabase Repositories Factory
 * 
 * Creates instances of all Supabase repositories.
 * Used by repository context to switch between demo and Supabase implementations.
 * 
 * PHASE 6 STEP 5: All core business domain repositories now implemented with Supabase.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Repositories } from "../interfaces";
import { SupabaseIdentityDocumentRepository } from "./identity-document-repository";
import { SupabasePlayerRepository } from "./player-repository";
import { SupabaseOrganizationRepository } from "./organization-repository";
import { SupabaseSeasonRepository } from "./season-repository";
import { SupabaseTeamRepository } from "./team-repository";
import { SupabaseStaffRepository } from "./staff-repository";
import { SupabaseTrainingRepository } from "./training-repository";
import { SupabaseCompetitionRepository } from "./competition-repository";
import { SupabaseMatchRepository } from "./match-repository";
import { SupabaseFinanceRepository } from "./finance-repository";
import { createSupabaseAuthRepository } from "@/repositories/auth/supabase-auth-repository";
import { createSupabaseUserProfileRepository } from "@/repositories/user-profile/supabase-user-profile-repository";
import { createSupabaseMembershipRepository } from "@/repositories/membership/supabase-membership-repository";
import { createDemoRepositories } from "../demo";

/**
 * Create all Supabase repositories
 * 
 * PHASE 6 STEP 5: Core business domains (Organization, Season, Team, Player, Staff, 
 * Training, Attendance, Competition, Match, Finance) are now implemented with Supabase.
 * 
 * Fallback repositories (notification, activity) still use demo implementations.
 */
export function createSupabaseRepositories(
  supabase: SupabaseClient,
  clubId: string,
  organizationId?: string
): Repositories {
  // Organization ID for RLS isolation (defaults to clubId if not provided)
  const orgId = organizationId || clubId;

  // Supabase implementations (PHASE 6 STEP 4 + STEP 5)
  const identityDocumentRepository = new SupabaseIdentityDocumentRepository(supabase);
  const playerRepository = new SupabasePlayerRepository(supabase, clubId);
  const authRepository = createSupabaseAuthRepository(supabase);
  const userProfileRepository = createSupabaseUserProfileRepository(supabase);
  const membershipRepository = createSupabaseMembershipRepository(supabase);

  // PHASE 6 STEP 5: Core business domain repositories
  const organizationRepository = new SupabaseOrganizationRepository(supabase);
  const seasonRepository = new SupabaseSeasonRepository(supabase, orgId);
  const teamRepository = new SupabaseTeamRepository(supabase, orgId);
  const staffRepository = new SupabaseStaffRepository(supabase, orgId);
  const trainingRepository = new SupabaseTrainingRepository(supabase, orgId);
  const competitionRepository = new SupabaseCompetitionRepository(supabase, orgId);
  const matchRepository = new SupabaseMatchRepository(supabase, orgId);
  const financeRepository = new SupabaseFinanceRepository(supabase, orgId);

  // Get demo repositories for notification and activity (to be implemented in future)
  const demoRepositories = createDemoRepositories(clubId);

  return {
    // Auth & Identity (PHASE 6 STEP 4)
    identityDocument: identityDocumentRepository,
    player: playerRepository,
    auth: authRepository,
    userProfile: userProfileRepository,
    membership: membershipRepository,

    // Core Business Domains (PHASE 6 STEP 5)
    organization: organizationRepository,
    season: seasonRepository,
    team: teamRepository,
    staff: staffRepository,
    training: trainingRepository,
    competition: competitionRepository,
    match: matchRepository,
    finance: financeRepository,

    // Fall back to demo for notification and activity (future steps)
    notification: demoRepositories.notification,
    activity: demoRepositories.activity,
  };
}

// Re-export repository classes
export { SupabaseIdentityDocumentRepository } from "./identity-document-repository";
export { SupabasePlayerRepository } from "./player-repository";
