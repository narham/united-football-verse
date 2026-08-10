/**
 * Supabase Training Repository
 * 
 * Real persistence implementation using Supabase PostgreSQL.
 * Manages training sessions and attendance records.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { safeError } from "@/lib/security/pii";
import type {
  TrainingSession,
  TrainingListParams,
  CreateTrainingInput,
  UpdateTrainingInput,
  Attendance,
  RecordAttendanceInput,
  ListResult,
  TrainingRepository,
} from "@/repositories/interfaces";

/**
 * Supabase implementation of TrainingRepository
 */
export class SupabaseTrainingRepository implements TrainingRepository {
  constructor(
    private supabase: SupabaseClient,
    private organizationId: string
  ) {}

  /**
   * List training sessions
   */
  async list(
    clubId: string,
    params?: TrainingListParams
  ): Promise<ListResult<TrainingSession>> {
    try {
      let query = this.supabase
        .from("training_sessions")
        .select("*", { count: "exact" })
        .eq("organization_id", this.organizationId)
        .eq("status", "ACTIVE");

      // Apply search
      if (params?.search) {
        const search = params.search.toLowerCase();
        query = query.or(`title.ilike.%${search}%,focus.ilike.%${search}%`);
      }

      // Apply day filter
      if (params?.day) {
        query = query.eq("day_of_week", params.day);
      }

      // Apply sorting
      query = query.order("day_of_week", { ascending: true });

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
        data: (data || []).map((t) => this.mapFromDatabase(t)),
        total,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      safeError("Failed to list training sessions:", error);
      throw error;
    }
  }

  /**
   * Get training session by ID
   */
  async getById(id: string): Promise<TrainingSession | null> {
    try {
      const { data, error } = await this.supabase
        .from("training_sessions")
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
      safeError("Failed to fetch training session:", error);
      throw error;
    }
  }

  /**
   * Create training session
   */
  async create(clubId: string, input: CreateTrainingInput): Promise<TrainingSession> {
    try {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from("training_sessions")
        .insert({
          id,
          organization_id: this.organizationId,
          team_id: input.teamId || undefined,
          title: input.title,
          day_of_week: input.day,
          start_time: input.startTime,
          end_time: input.endTime,
          location: input.location,
          focus: input.focus,
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
      safeError("Failed to create training session:", error);
      throw error;
    }
  }

  /**
   * Update training session
   */
  async update(
    id: string,
    input: UpdateTrainingInput
  ): Promise<TrainingSession> {
    try {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (input.title !== undefined) payload['title'] = input.title;
      if (input.day !== undefined) payload['day_of_week'] = input.day;
      if (input.startTime !== undefined) payload['start_time'] = input.startTime;
      if (input.endTime !== undefined) payload['end_time'] = input.endTime;
      if (input.location !== undefined) payload['location'] = input.location;
      if (input.focus !== undefined) payload['focus'] = input.focus;
      if (input.teamId !== undefined) payload['team_id'] = input.teamId;

      const { data, error } = await this.supabase
        .from("training_sessions")
        .update(payload)
        .eq("id", id)
        .eq("organization_id", this.organizationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Training session not found");
      }

      return this.mapFromDatabase(data);
    } catch (error) {
      safeError("Failed to update training session:", error);
      throw error;
    }
  }

  /**
   * Delete training session (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("training_sessions")
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
      safeError("Failed to delete training session:", error);
      throw error;
    }
  }

  /**
   * Record attendance for a training
   */
  async recordAttendance(input: RecordAttendanceInput): Promise<Attendance> {
    try {
      const id = crypto.randomUUID();

      const { data, error } = await this.supabase
        .from("attendance")
        .upsert(
          {
            id,
            organization_id: this.organizationId,
            training_id: input.trainingId,
            player_id: input.playerId,
            status: this.mapStatusToDatabase(input.status),
            date: input.date,
            recorded_at: new Date().toISOString(),
          },
          { onConflict: "training_id,player_id,date" }
        )
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapAttendanceFromDatabase(data);
    } catch (error) {
      safeError("Failed to record attendance:", error);
      throw error;
    }
  }

  /**
   * Get attendance records for a training
   */
  async getAttendance(trainingId: string): Promise<Attendance[]> {
    try {
      const { data, error } = await this.supabase
        .from("attendance")
        .select("*")
        .eq("training_id", trainingId)
        .eq("organization_id", this.organizationId);

      if (error) {
        throw error;
      }

      return (data || []).map((a) => this.mapAttendanceFromDatabase(a));
    } catch (error) {
      safeError("Failed to fetch attendance:", error);
      throw error;
    }
  }

  /**
   * Get attendance by date
   */
  async getAttendanceByDate(clubId: string, date: string): Promise<Attendance[]> {
    try {
      const { data, error } = await this.supabase
        .from("attendance")
        .select("*")
        .eq("organization_id", this.organizationId)
        .eq("date", date);

      if (error) {
        throw error;
      }

      return (data || []).map((a) => this.mapAttendanceFromDatabase(a));
    } catch (error) {
      safeError("Failed to fetch attendance by date:", error);
      throw error;
    }
  }

  /**
   * Map attendance status to database format
   */
  private mapStatusToDatabase(status: string): string {
    const statusMap: Record<string, string> = {
      "hadir": "PRESENT",
      "sakit": "ABSENT_SICK",
      "izin": "ABSENT_PERMISSION",
      "alpha": "ABSENT_UNEXCUSED",
      "terlambat": "LATE",
      "PRESENT": "PRESENT",
      "ABSENT_SICK": "ABSENT_SICK",
      "ABSENT_PERMISSION": "ABSENT_PERMISSION",
      "ABSENT_UNEXCUSED": "ABSENT_UNEXCUSED",
      "LATE": "LATE",
    };
    return statusMap[status] || status;
  }

  /**
   * Map attendance status from database format
   */
  private mapStatusFromDatabase(status: string): "hadir" | "sakit" | "izin" | "alpha" | "terlambat" {
    const statusMap: Record<string, any> = {
      "PRESENT": "hadir",
      "ABSENT_SICK": "sakit",
      "ABSENT_PERMISSION": "izin",
      "ABSENT_UNEXCUSED": "alpha",
      "LATE": "terlambat",
    };
    return statusMap[status] || "hadir";
  }

  /**
   * Map training from database format to application format
   */
  private mapFromDatabase(row: any): TrainingSession {
    return {
      id: row['id'],
      clubId: this.organizationId,
      teamId: row['team_id'] || undefined,
      title: row['title'],
      day: row['day_of_week'],
      startTime: row['start_time'],
      endTime: row['end_time'],
      location: row['location'],
      focus: row['focus'],
      createdAt: row['created_at'],
      updatedAt: row['updated_at'],
    };
  }

  /**
   * Map attendance from database format
   */
  private mapAttendanceFromDatabase(row: any): Attendance {
    return {
      id: row.id,
      trainingId: row.training_id,
      playerId: row.player_id,
      status: this.mapStatusFromDatabase(row.status),
      date: row.date,
      createdAt: row.recorded_at,
    };
  }
}
