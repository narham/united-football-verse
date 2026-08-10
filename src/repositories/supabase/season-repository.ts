/**
 * Supabase Season Repository
 * 
 * Real persistence implementation using Supabase PostgreSQL.
 * Manages football seasons with business rule: only 1 ACTIVE season per organization.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { safeError } from "@/lib/security/pii";
import type {
  Season,
  CreateSeasonInput,
  UpdateSeasonInput,
  SeasonRepository,
} from "@/repositories/interfaces";

/**
 * Supabase implementation of SeasonRepository
 * 
 * Business Rule: Only one season can have status='ACTIVE' per organization at any time.
 * DRAFT seasons can be configured, ARCHIVED are read-only.
 */
export class SupabaseSeasonRepository implements SeasonRepository {
  constructor(
    private supabase: SupabaseClient,
    private organizationId: string
  ) {}

  /**
   * List all seasons for organization
   */
  async list(clubId: string): Promise<Season[]> {
    try {
      const { data, error } = await this.supabase
        .from("seasons")
        .select("*")
        .eq("organization_id", this.organizationId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map((s) => this.mapFromDatabase(s));
    } catch (error) {
      safeError("Failed to list seasons:", error);
      throw error;
    }
  }

  /**
   * Get season by ID
   */
  async getById(id: string): Promise<Season | null> {
    try {
      const { data, error } = await this.supabase
        .from("seasons")
        .select("*")
        .eq("id", id)
        .eq("organization_id", this.organizationId)
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
      safeError("Failed to fetch season:", error);
      throw error;
    }
  }

  /**
   * Create new season
   */
  async create(clubId: string, input: CreateSeasonInput): Promise<Season> {
    try {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from("seasons")
        .insert({
          id,
          organization_id: this.organizationId,
          name: input.name,
          start_date: input.startDate,
          end_date: input.endDate,
          status: "DRAFT", // New seasons start as DRAFT
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
      safeError("Failed to create season:", error);
      throw error;
    }
  }

  /**
   * Update season
   */
  async update(id: string, input: UpdateSeasonInput): Promise<Season> {
    try {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (input.name !== undefined) payload['name'] = input.name;
      if (input.startDate !== undefined) payload['start_date'] = input.startDate;
      if (input.endDate !== undefined) payload['end_date'] = input.endDate;
      if (input.status !== undefined) {
        // Convert status to database format
        const statusMap: Record<string, string> = {
          "Aktif": "ACTIVE",
          "Tidak Aktif": "DRAFT",
          "Selesai": "ARCHIVED",
          "ACTIVE": "ACTIVE",
          "DRAFT": "DRAFT",
          "ARCHIVED": "ARCHIVED",
        };
        payload['status'] = statusMap[input.status] || input.status;
      }

      const { data, error } = await this.supabase
        .from("seasons")
        .update(payload)
        .eq("id", id)
        .eq("organization_id", this.organizationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Season not found");
      }

      return this.mapFromDatabase(data);
    } catch (error) {
      safeError("Failed to update season:", error);
      throw error;
    }
  }

  /**
   * Delete season (soft delete via status)
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("seasons")
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
      safeError("Failed to delete season:", error);
      throw error;
    }
  }

  /**
   * Get active season for organization
   * Business rule: Only one ACTIVE season per org
   */
  async getActive(clubId: string): Promise<Season | null> {
    try {
      const { data, error } = await this.supabase
        .from("seasons")
        .select("*")
        .eq("organization_id", this.organizationId)
        .eq("status", "ACTIVE")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No active season found
          return null;
        }
        throw error;
      }

      return data ? this.mapFromDatabase(data) : null;
    } catch (error) {
      safeError("Failed to fetch active season:", error);
      throw error;
    }
  }

  /**
   * Set season as active
   * Business rule: Automatically deactivates other seasons in same organization
   */
  async setActive(id: string): Promise<void> {
    try {
      // Deactivate all other active seasons in this org
      await this.supabase
        .from("seasons")
        .update({
          status: "DRAFT",
          updated_at: new Date().toISOString(),
        })
        .eq("organization_id", this.organizationId)
        .eq("status", "ACTIVE");

      // Activate this season
      const { error } = await this.supabase
        .from("seasons")
        .update({
          status: "ACTIVE",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("organization_id", this.organizationId);

      if (error) {
        throw error;
      }
    } catch (error) {
      safeError("Failed to set active season:", error);
      throw error;
    }
  }

  /**
   * Map database format (snake_case) to application format (camelCase)
   */
  private mapFromDatabase(row: any): Season {
    // Convert database status to app format
    const statusMap: Record<string, "Aktif" | "Tidak Aktif" | "Selesai"> = {
      "ACTIVE": "Aktif",
      "DRAFT": "Tidak Aktif",
      "ARCHIVED": "Selesai",
    };

    return {
      id: row['id'],
      clubId: this.organizationId, // Match organization ID
      name: row['name'],
      startDate: row['start_date'],
      endDate: row['end_date'],
      status: statusMap[row['status']] || "Tidak Aktif",
      createdAt: row['created_at'],
      updatedAt: row['updated_at'],
    };
  }
}
