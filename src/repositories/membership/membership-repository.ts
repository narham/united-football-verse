/**
 * Membership Repository Interface
 * 
 * Manages organization memberships.
 * A membership links a user to an organization with a role.
 * 
 * Implementations: Demo, Supabase
 */

import type { OrganizationMembership, ListResult } from "@/domain/auth/auth-types";

export interface MembershipRepository {
  /**
   * Get memberships for current user
   * Returns all active/suspended memberships
   */
  listMyMemberships(): Promise<OrganizationMembership[]>;

  /**
   * Get specific membership by ID
   */
  getMembership(id: string): Promise<OrganizationMembership | null>;

  /**
   * Get user's memberships in a specific organization
   */
  getMembershipByOrganization(organizationId: string): Promise<OrganizationMembership | null>;

  /**
   * Switch to a different organization
   * Updates the current organization context
   * Does not change role or membership itself
   */
  switchOrganization(organizationId: string): Promise<OrganizationMembership>;

  /**
   * Get current active membership
   * Falls back to first active membership if not explicitly set
   */
  getCurrentMembership(): Promise<OrganizationMembership | null>;
}
