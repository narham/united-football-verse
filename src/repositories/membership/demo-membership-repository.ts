/**
 * Demo Membership Repository
 * Simulates organization memberships using localStorage
 */

import type { OrganizationMembership } from "@/domain/auth/auth-types";
import type { MembershipRepository } from "./membership-repository";

const DEMO_MEMBERSHIPS_KEY = "demo:memberships";
const DEMO_CURRENT_ORG_KEY = "demo:currentOrg";

/**
 * Initialize demo memberships
 * Demo user belongs to all demo clubs
 */
function initializeMemberships() {
  if (!localStorage.getItem(DEMO_MEMBERSHIPS_KEY)) {
    localStorage.setItem(
      DEMO_MEMBERSHIPS_KEY,
      JSON.stringify([
        {
          id: "membership-001",
          userId: "demo-profile-001",
          organizationId: "club-1",
          role: "ORG_OWNER",
          status: "ACTIVE",
          joinedAt: new Date(2023, 0, 1).toISOString(),
          createdAt: new Date(2023, 0, 1).toISOString(),
          updatedAt: new Date(2023, 0, 1).toISOString(),
        },
        {
          id: "membership-002",
          userId: "demo-profile-001",
          organizationId: "club-2",
          role: "MANAGER",
          status: "ACTIVE",
          joinedAt: new Date(2023, 6, 1).toISOString(),
          createdAt: new Date(2023, 6, 1).toISOString(),
          updatedAt: new Date(2023, 6, 1).toISOString(),
        },
        {
          id: "membership-003",
          userId: "demo-profile-001",
          organizationId: "club-3",
          role: "COACH",
          status: "ACTIVE",
          joinedAt: new Date(2024, 0, 1).toISOString(),
          createdAt: new Date(2024, 0, 1).toISOString(),
          updatedAt: new Date(2024, 0, 1).toISOString(),
        },
      ])
    );
  }

  // Set default current organization if not set
  if (!localStorage.getItem(DEMO_CURRENT_ORG_KEY)) {
    localStorage.setItem(DEMO_CURRENT_ORG_KEY, "club-1");
  }
}

export class DemoMembershipRepository implements MembershipRepository {
  constructor() {
    initializeMemberships();
  }

  async listMyMemberships(): Promise<OrganizationMembership[]> {
    const memberships = this.getMemberships();
    return memberships.filter((m) => m.userId === "demo-profile-001");
  }

  async getMembership(id: string): Promise<OrganizationMembership | null> {
    const memberships = this.getMemberships();
    return memberships.find((m) => m.id === id) ?? null;
  }

  async getMembershipByOrganization(organizationId: string): Promise<OrganizationMembership | null> {
    const memberships = this.getMemberships();
    return (
      memberships.find(
        (m) => m.userId === "demo-profile-001" && m.organizationId === organizationId
      ) ?? null
    );
  }

  async switchOrganization(organizationId: string): Promise<OrganizationMembership> {
    const membership = await this.getMembershipByOrganization(organizationId);

    if (!membership) {
      throw new Error("No membership in this organization");
    }

    if (membership.status !== "ACTIVE") {
      throw new Error("Membership is not active");
    }

    // Store current organization
    localStorage.setItem(DEMO_CURRENT_ORG_KEY, organizationId);

    return membership;
  }

  async getCurrentMembership(): Promise<OrganizationMembership | null> {
    const currentOrgId = localStorage.getItem(DEMO_CURRENT_ORG_KEY) || "club-1";
    return this.getMembershipByOrganization(currentOrgId);
  }

  private getMemberships(): OrganizationMembership[] {
    const stored = localStorage.getItem(DEMO_MEMBERSHIPS_KEY);
    return stored ? JSON.parse(stored) : [];
  }
}

export function createDemoMembershipRepository(): MembershipRepository {
  return new DemoMembershipRepository();
}
