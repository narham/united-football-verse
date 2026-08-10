/**
 * Supabase Competition Repository
 * 
 * Real persistence implementation using Supabase PostgreSQL.
 * Manages competitions/tournaments for organizing matches.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { safeError } from "@/lib/security/pii";
import type {
  Competition,
  CreateCompetitionInput,
  UpdateCompetitionInput,
  CompetitionRepository,
} from "@/repositories/interfaces";

/**
 * Supabase implementation of CompetitionRepository
 */
export class SupabaseCompetitionRepository implements CompetitionRepository {
  constructor(
    private supabase: SupabaseClient,
    private organizationId: string
  ) {}

  /**
   * List competitions for organization
   */
  async list(clubId: string): Promise<Competition[]> {
    try {
      const { data, error } = await this.supabase
        .from("competitions")
        .select("*")
        .eq("organization_id", this.organizationId)
        .order("name", { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []).map((c) => this.mapFromDatabase(c));
    } catch (error) {
      safeError("Failed to list competitions:", error);
      throw error;
    }
  }

  /**
   * Get competition by ID
   */
  async getById(id: string): Promise<Competition | null> {
    try {
      const { data, error } = await this.supabase
        .from("competitions")
        .select("*")
        .eq("id", id)
        .eq("organization_id", this.organizationId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data ? this.mapFromDatabase(data) : null;
    } catch (error) {
      safeError("Failed to fetch competition:", error);
      throw error;
    }
  }

  /**
   * Create competition
   */
  async create(clubId: string, input: CreateCompetitionInput): Promise<Competition> {
    try {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from("competitions")
        .insert({
          id,
          organization_id: this.organizationId,
          season_id: input.seasonId || undefined,
          name: input.name,
          level: input.level || undefined,
          status: "ACTIVE",
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapFromDatabase(data);
    } catch (error) {
      safeError("Failed to create competition:", error);
      throw error;
    }
  }

  /**
   * Update competition
   */
  async update(
    id: string,
    input: UpdateCompetitionInput
  ): Promise<Competition> {
    try {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (input.name !== undefined) payload['name'] = input.name;
      if (input.level !== undefined) payload['level'] = input.level;
      if (input.seasonId !== undefined) payload['season_id'] = input.seasonId;

      const { data, error } = await this.supabase
        .from("competitions")
        .update(payload)
        .eq("id", id)
        .eq("organization_id", this.organizationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Competition not found");
      }

      return this.mapFromDatabase(data);
    } catch (error) {
      safeError("Failed to update competition:", error);
      throw error;
    }
  }

  /**
   * Delete competition (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("competitions")
        .update({
          status: "ARCHIVED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("organization_id", this.organizationId);

      if (error) {
        throw error;
      }
    } catch (error) {
      safeError("Failed to delete competition:", error);
      throw error;
    }
  }

  /**
   * Map database format to application format
   */
  private mapFromDatabase(row: any): Competition {
    return {
      id: row['id'],
      clubId: this.organizationId,
      name: row['name'],
      season: row['season_id'] || "2026/2027",
      level: row['level'] || "Kompetisi",
      createdAt: row['created_at'],
      updatedAt: row['updated_at'],
    };
  }
}
