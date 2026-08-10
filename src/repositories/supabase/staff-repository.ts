/**
 * Supabase Staff Repository
 * 
 * Real persistence implementation using Supabase PostgreSQL.
 * Manages coaching and administrative staff members.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Staff,
  StaffListParams,
  CreateStaffInput,
  UpdateStaffInput,
  ListResult,
  StaffRepository,
} from "@/repositories/interfaces";

/**
 * Supabase implementation of StaffRepository
 */
export class SupabaseStaffRepository implements StaffRepository {
  constructor(
    private supabase: SupabaseClient,
    private organizationId: string
  ) {}

  /**
   * List staff members for organization
   */
  async list(clubId: string, params?: StaffListParams): Promise<ListResult<Staff>> {
    try {
      let query = this.supabase
        .from("staff")
        .select("*", { count: "exact" })
        .eq("organization_id", this.organizationId);

      // Apply search
      if (params?.search) {
        const search = params.search.toLowerCase();
        query = query.or(`name.ilike.%${search}%,telephone.ilike.%${search}%`);
      }

      // Apply role filter
      if (params?.role) {
        query = query.eq("role", params.role);
      }

      // Apply status filter
      if (params?.status) {
        query = query.eq("status", params.status);
      }

      // Apply sorting
      query = query.order("name", { ascending: true });

      // Apply pagination
      const offset = params?.offset || 0;
      const limit = params?.limit || 20;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const total = count || data?.length || 0;
      return {
        data: (data || []).map((s) => this.mapFromDatabase(s)),
        total,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      console.error("Failed to list staff:", error);
      throw error;
    }
  }

  /**
   * Get staff member by ID
   */
  async getById(id: string): Promise<Staff | null> {
    try {
      const { data, error } = await this.supabase
        .from("staff")
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
      console.error("Failed to fetch staff:", error);
      throw error;
    }
  }

  /**
   * Create staff member
   */
  async create(clubId: string, input: CreateStaffInput): Promise<Staff> {
    try {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from("staff")
        .insert({
          id,
          organization_id: this.organizationId,
          name: input.name,
          role: this.mapRoleToDatabase(input.role),
          telephone: input.telephone || undefined,
          email: input.email || undefined,
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
      console.error("Failed to create staff:", error);
      throw error;
    }
  }

  /**
   * Update staff member
   */
  async update(id: string, input: UpdateStaffInput): Promise<Staff> {
    try {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (input.name !== undefined) payload.name = input.name;
      if (input.role !== undefined) payload.role = this.mapRoleToDatabase(input.role);
      if (input.telephone !== undefined) payload.telephone = input.telephone;
      if (input.email !== undefined) payload.email = input.email;

      const { data, error } = await this.supabase
        .from("staff")
        .update(payload)
        .eq("id", id)
        .eq("organization_id", this.organizationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Staff member not found");
      }

      return this.mapFromDatabase(data);
    } catch (error) {
      console.error("Failed to update staff:", error);
      throw error;
    }
  }

  /**
   * Delete staff member (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("staff")
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
      console.error("Failed to delete staff:", error);
      throw error;
    }
  }

  /**
   * Map staff role from app format to database format
   */
  private mapRoleToDatabase(role: string): string {
    const roleMap: Record<string, string> = {
      "Kepala Pelatih": "HEAD_COACH",
      "Asisten Pelatih": "ASSISTANT_COACH",
      "Pelatih Kiper": "GK_COACH",
      "Fisioterapis": "PHYSIO",
      "Manager": "MANAGER",
      "Operator": "OPERATOR",
      // Database format (if already mapped)
      "HEAD_COACH": "HEAD_COACH",
      "ASSISTANT_COACH": "ASSISTANT_COACH",
      "GK_COACH": "GK_COACH",
      "PHYSIO": "PHYSIO",
    };
    return roleMap[role] || role;
  }

  /**
   * Map staff role from database format to app format
   */
  private mapRoleFromDatabase(role: string): string {
    const roleMap: Record<string, string> = {
      "HEAD_COACH": "Kepala Pelatih",
      "ASSISTANT_COACH": "Asisten Pelatih",
      "GK_COACH": "Pelatih Kiper",
      "PHYSIO": "Fisioterapis",
      "MANAGER": "Manager",
      "OPERATOR": "Operator",
    };
    return roleMap[role] || role;
  }

  /**
   * Map database format to application format
   */
  private mapFromDatabase(row: any): Staff {
    return {
      id: row.id,
      clubId: this.organizationId,
      name: row.name,
      role: this.mapRoleFromDatabase(row.role),
      telephone: row.telephone || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
