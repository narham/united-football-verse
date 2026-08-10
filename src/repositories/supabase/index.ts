/**
 * Supabase Repositories Factory
 * 
 * Creates instances of all Supabase repositories.
 * Used by repository context to switch between demo and Supabase implementations.
 * 
 * Note: Only identity and player repositories are implemented in Step 3.
 * Other repositories fall back to demo mode via the factory.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Repositories } from "../interfaces";
import { SupabaseIdentityDocumentRepository } from "./identity-document-repository";
import { SupabasePlayerRepository } from "./player-repository";
import { createDemoRepositories } from "../demo";

/**
 * Create all Supabase repositories
 * 
 * For Step 3, only identity and player repositories are implemented.
 * Other repositories use demo implementations.
 */
export function createSupabaseRepositories(
  supabase: SupabaseClient,
  clubId: string
): Repositories {
  // Supabase implementations (Step 3)
  const identityDocumentRepository = new SupabaseIdentityDocumentRepository(supabase);
  const playerRepository = new SupabasePlayerRepository(supabase, clubId);

  // Get demo repositories for unimplemented repositories
  const demoRepositories = createDemoRepositories(clubId);

  return {
    identityDocument: identityDocumentRepository,
    player: playerRepository,
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
