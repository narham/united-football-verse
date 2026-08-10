/**
 * Supabase Team Repository
 * 
 * Real persistence implementation using Supabase PostgreSQL.
 * Manages teams within seasons (e.g., U-19 team, First Team).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Team,
  CreateTeamInput,
  UpdateTeamInput,
  TeamRepository,
  TeamStats,
} from "@/repositories/interfaces";

/**
 * Supabase implementation of TeamRepository
 */
export class SupabaseTeamRepository implements TeamRepository {
  constructor(
    private supabase: SupabaseClient,
    private organizationId: string
  ) {}

  /**
   * List teams for organization
   */
  async list(clubId: string): Promise<Team[]> {
    try {
      const { data, error } = await this.supabase
        .from("teams")
        .select("*")
        .eq("organization_id", this.organizationId)
        .order("name", { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []).map((t) => this.mapFromDatabase(t));
    } catch (error) {
      console.error("Failed to list teams:", error);
      throw error;
    }
  }

  /**
   * Get team by ID
   */
  async getById(id: string): Promise<Team | null> {
    try {
      const { data, error } = await this.supabase
        .from("teams")
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
      console.error("Failed to fetch team:", error);
      throw error;
    }
  }

  /**
   * Create team
   */
  async create(clubId: string, input: CreateTeamInput): Promise<Team> {
    try {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from("teams")
        .insert({
          id,
          organization_id: this.organizationId,
          season_id: input.seasonId,
          name: input.name,
          category: input.category || undefined,
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
      console.error("Failed to create team:", error);
      throw error;
    }
  }

  /**
   * Update team
   */
  async update(id: string, input: UpdateTeamInput): Promise<Team> {
    try {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (input.name !== undefined) payload.name = input.name;
      if (input.category !== undefined) payload.category = input.category;
      if (input.status !== undefined) payload.status = input.status;

      const { data, error } = await this.supabase
        .from("teams")
        .update(payload)
        .eq("id", id)
        .eq("organization_id", this.organizationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Team not found");
      }

      return this.mapFromDatabase(data);
    } catch (error) {
      console.error("Failed to update team:", error);
      throw error;
    }
  }

  /**
   * Delete team (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("teams")
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
      console.error("Failed to delete team:", error);
      throw error;
    }
  }

  /**
   * Get team statistics for a season
   */
  async getStats(teamId: string, season: string): Promise<TeamStats> {
    try {
      // Count players
      const { count: playerCount } = await this.supabase
        .from("players")
        .select("*", { count: "exact" })
        .eq("team_id", teamId)
        .eq("status", "ACTIVE");

      // Get recent matches
      const { data: matches } = await this.supabase
        .from("matches")
        .select("*")
        .eq("team_id", teamId)
        .eq("status", "COMPLETED")
        .order("match_date", { ascending: false })
        .limit(10);

      // Calculate record: W-D-L
      let wins = 0, draws = 0, losses = 0;
      let goalsFor = 0, goalsAgainst = 0;

      for (const match of matches || []) {
        if (match.score_home !== null && match.score_away !== null) {
          const ourScore = match.venue === "HOME" ? match.score_home : match.score_away;
          const theirScore = match.venue === "HOME" ? match.score_away : match.score_home;

          goalsFor += ourScore;
          goalsAgainst += theirScore;

          if (ourScore > theirScore) wins++;
          else if (ourScore === theirScore) draws++;
          else losses++;
        }
      }

      return {
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        playerCount: playerCount || 0,
        totalMatches: (matches || []).length,
      };
    } catch (error) {
      console.error("Failed to fetch team stats:", error);
      throw error;
    }
  }

  /**
   * Map database format to application format
   */
  private mapFromDatabase(row: any): Team {
    return {
      id: row.id,
      seasonId: row.season_id,
      name: row.name,
      category: row.category || undefined,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
