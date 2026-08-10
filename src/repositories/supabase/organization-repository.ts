/**
 * Supabase Organization Repository
 * 
 * Real persistence implementation using Supabase PostgreSQL.
 * Manages football clubs/academies (organizations) for multi-tenant system.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { safeError } from "@/lib/security/pii";
import type { Club, OrganizationRepository } from "@/repositories/interfaces";

/**
 * Supabase implementation of OrganizationRepository
 */
export class SupabaseOrganizationRepository implements OrganizationRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get single organization by ID
   */
  async getClub(clubId: string): Promise<Club | null> {
    try {
      const { data, error } = await this.supabase
        .from("organizations")
        .select("*")
        .eq("id", clubId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows found
          return null;
        }
        throw error;
      }

      return data ? this.mapFromDatabase(data) : null;
    } catch (error) {
      safeError("Failed to fetch organization:", error);
      throw error;
    }
  }

  /**
   * Update organization
   */
  async updateClub(clubId: string, clubUpdate: Partial<Club>): Promise<Club> {
    try {
      // Prepare update payload (map from app format to database format)
      const payload: Record<string, any> = {};
      
      if (clubUpdate.name !== undefined) payload['name'] = clubUpdate.name;
      if (clubUpdate.short !== undefined) payload['short'] = clubUpdate.short;
      if (clubUpdate.city !== undefined) payload['city'] = clubUpdate.city;
      if (clubUpdate.foundedYear !== undefined) payload['founded_year'] = clubUpdate.foundedYear;
      if (clubUpdate.logoUrl !== undefined) payload['logo_url'] = clubUpdate.logoUrl;
      if (clubUpdate.season !== undefined) payload['season'] = clubUpdate.season;
      if (clubUpdate.sport !== undefined) payload['sport'] = clubUpdate.sport;
      if (clubUpdate.footballOrgId !== undefined) payload['football_org_id'] = clubUpdate.footballOrgId;
      
      payload['updated_at'] = new Date().toISOString();

      const { data, error } = await this.supabase
        .from("organizations")
        .update(payload)
        .eq("id", clubId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Organization not found after update");
      }

      return this.mapFromDatabase(data);
    } catch (error) {
      safeError("Failed to update organization:", error);
      throw error;
    }
  }

  /**
   * Get all organizations (user-accessible)
   * This is filtered at RLS level to show only user's organizations
   */
  async getClubs(): Promise<Club[]> {
    try {
      const { data, error } = await this.supabase
        .from("organizations")
        .select("*")
        .eq("status", "ACTIVE")
        .order("name", { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []).map((org) => this.mapFromDatabase(org));
    } catch (error) {
      safeError("Failed to fetch organizations:", error);
      throw error;
    }
  }

  /**
   * Map database format (snake_case) to application format (camelCase)
   */
  private mapFromDatabase(row: any): Club {
    return {
      id: row['id'],
      name: row['name'],
      short: row['short'] || undefined,
      city: row['city'] || undefined,
      foundedYear: row['founded_year'] || undefined,
      season: row['season'] || "2026/2027",
      sport: row['sport'] || "Sepak Bola",
      logoUrl: row['logo_url'] || undefined,
      footballOrgId: row['football_org_id'] || undefined,
    };
  }
}
