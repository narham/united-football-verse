/**
 * Demo Repositories Factory
 * Creates all demo repository instances with shared localStorage
 */

import type { Repositories } from "@/repositories/interfaces";
import { DemoPlayerRepository } from "./player-repository";
import { DemoStaffRepository } from "./staff-repository";
import { DemoTeamRepository } from "./team-repository";
import { DemoSeasonRepository } from "./season-repository";
import { DemoTrainingRepository } from "./training-repository";
import { DemoCompetitionRepository } from "./competition-repository";
import { DemoMatchRepository } from "./match-repository";
import { DemoFinanceRepository } from "./finance-repository";
import { DemoNotificationRepository } from "./notification-repository";
import { DemoActivityRepository } from "./activity-repository";
import { DemoOrganizationRepository } from "./organization-repository";
import { DemoIdentityDocumentRepository } from "./identity-document-repository";
import { createDemoAuthRepository } from "@/repositories/auth/demo-auth-repository";
import { createDemoUserProfileRepository } from "@/repositories/user-profile/demo-user-profile-repository";
import { createDemoMembershipRepository } from "@/repositories/membership/demo-membership-repository";
import { DemoStorage } from "./storage";

export function createDemoRepositories(clubId: string): Repositories {
  const storage = new DemoStorage({ debug: false });

  return {
    player: new DemoPlayerRepository(storage),
    staff: new DemoStaffRepository(storage),
    team: new DemoTeamRepository(storage),
    season: new DemoSeasonRepository(storage),
    training: new DemoTrainingRepository(storage),
    competition: new DemoCompetitionRepository(storage),
    match: new DemoMatchRepository(storage),
    finance: new DemoFinanceRepository(storage),
    notification: new DemoNotificationRepository(storage),
    activity: new DemoActivityRepository(storage),
    organization: new DemoOrganizationRepository(storage),
    identityDocument: new DemoIdentityDocumentRepository(storage),
    auth: createDemoAuthRepository(),
    userProfile: createDemoUserProfileRepository(),
    membership: createDemoMembershipRepository(),
  };
}
