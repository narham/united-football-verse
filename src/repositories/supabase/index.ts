/**
 * Supabase Repositories Factory
 * 
 * Creates instances of all Supabase repositories.
 * Used by repository context to switch between demo and Supabase implementations.
 * 
 * Note: Only identity, player, and auth repositories are implemented in Step 4.
 * Other repositories fall back to demo mode via the factory.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Repositories } from "../interfaces";
import { SupabaseIdentityDocumentRepository } from "./identity-document-repository";
import { SupabasePlayerRepository } from "./player-repository";
import { createSupabaseAuthRepository } from "@/repositories/auth/supabase-auth-repository";
import { createSupabaseUserProfileRepository } from "@/repositories/user-profile/supabase-user-profile-repository";
import { createSupabaseMembershipRepository } from "@/repositories/membership/supabase-membership-repository";
import { createDemoRepositories } from "../demo";

/**
 * Create all Supabase repositories
 * 
 * For Step 4, auth, user profile, and membership repositories are implemented.
 * Identity and player repositories from Step 3 are included.
 * Other repositories use demo implementations.
 */
export function createSupabaseRepositories(
  supabase: SupabaseClient,
  clubId: string
): Repositories {
  // Supabase implementations (Step 3 + Step 4)
  const identityDocumentRepository = new SupabaseIdentityDocumentRepository(supabase);
  const playerRepository = new SupabasePlayerRepository(supabase, clubId);
  const authRepository = createSupabaseAuthRepository(supabase);
  const userProfileRepository = createSupabaseUserProfileRepository(supabase);
  const membershipRepository = createSupabaseMembershipRepository(supabase);

  // Get demo repositories for unimplemented repositories
  const demoRepositories = createDemoRepositories(clubId);

  return {
    identityDocument: identityDocumentRepository,
    player: playerRepository,
    auth: authRepository,
    userProfile: userProfileRepository,
    membership: membershipRepository,
    // Fall back to demo for other repositories (to be implemented in future steps)
    staff: demoRepositories.staff,
    team: demoRepositories.team,
    season: demoRepositories.season,
    training: demoRepositories.training,
    match: demoRepositories.match,
    finance: demoRepositories.finance,
    notification: demoRepositories.notification,
    activity: demoRepositories.activity,
    competition: demoRepositories.competition,
    organization: demoRepositories.organization,
  };
}

// Re-export repository classes
export { SupabaseIdentityDocumentRepository } from "./identity-document-repository";
export { SupabasePlayerRepository } from "./player-repository";
