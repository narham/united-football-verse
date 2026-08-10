/**
 * Supabase Membership Repository
 * Fetches from organization_memberships table
 */

import type { OrganizationMembership } from "@/domain/auth/auth-types";
import type { MembershipRepository } from "./membership-repository";
import type { SupabaseClient } from "@supabase/supabase-js";

const CURRENT_ORG_KEY = "currentOrganization";

export class SupportabaseMembershipRepository implements MembershipRepository {
  constructor(private supabase: SupabaseClient) {}

  async listMyMemberships(): Promise<OrganizationMembership[]> {
    const { data: authData } = await this.supabase.auth.getUser();

    if (!authData.user) {
      throw new Error("Not authenticated");
    }

    // Get user profile to get userId
    const { data: profileData } = await this.supabase
      .from("user_profiles")
      .select("id")
      .eq("auth_user_id", authData.user.id)
      .single();

    if (!profileData) {
      throw new Error("User profile not found");
    }

    const { data, error } = await this.supabase
      .from("organization_memberships")
      .select("*")
      .eq("user_id", profileData.id);

    if (error || !data) {
      throw new Error("Failed to fetch memberships");
    }

    return data.map((m: any) => this.mapMembership(m));
  }

  async getMembership(id: string): Promise<OrganizationMembership | null> {
    const { data, error } = await this.supabase
      .from("organization_memberships")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapMembership(data);
  }

  async getMembershipByOrganization(organizationId: string): Promise<OrganizationMembership | null> {
    const { data: authData } = await this.supabase.auth.getUser();

    if (!authData.user) {
      throw new Error("Not authenticated");
    }

    // Get user profile
    const { data: profileData } = await this.supabase
      .from("user_profiles")
      .select("id")
      .eq("auth_user_id", authData.user.id)
      .single();

    if (!profileData) {
      throw new Error("User profile not found");
    }

    const { data, error } = await this.supabase
      .from("organization_memberships")
      .select("*")
      .eq("user_id", profileData.id)
      .eq("organization_id", organizationId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapMembership(data);
  }

  async switchOrganization(organizationId: string): Promise<OrganizationMembership> {
    const membership = await this.getMembershipByOrganization(organizationId);

    if (!membership) {
      throw new Error("No membership in this organization");
    }

    if (membership.status !== "ACTIVE") {
      throw new Error("Membership is not active");
    }

    // Store in localStorage (UX preference, not security authority)
    localStorage.setItem(CURRENT_ORG_KEY, organizationId);

    return membership;
  }

  async getCurrentMembership(): Promise<OrganizationMembership | null> {
    // Check if there's a stored preference
    const storedOrgId = localStorage.getItem(CURRENT_ORG_KEY);

    if (storedOrgId) {
      const membership = await this.getMembershipByOrganization(storedOrgId);
      if (membership && membership.status === "ACTIVE") {
        return membership;
      }
    }

    // Fall back to first active membership
    const memberships = await this.listMyMemberships();
    return memberships.find((m) => m.status === "ACTIVE") ?? null;
  }

  private mapMembership(data: any): OrganizationMembership {
    return {
      id: data.id,
      userId: data.user_id,
      organizationId: data.organization_id,
      role: data.role,
      status: data.status as "ACTIVE" | "INVITED" | "SUSPENDED" | "REVOKED",
      joinedAt: data.joined_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export function createSupabaseMembershipRepository(
  supabase: SupabaseClient
): MembershipRepository {
  return new SupportabaseMembershipRepository(supabase);
}
