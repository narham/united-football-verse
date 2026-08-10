/**
 * Supabase Match Repository
 * 
 * Real persistence implementation using Supabase PostgreSQL.
 * Manages matches within competitions.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { safeError } from "@/lib/security/pii";
import type {
  Match,
  MatchListParams,
  CreateMatchInput,
  UpdateMatchInput,
  MatchResult,
  MatchRecordStats,
  ListResult,
  MatchRepository,
} from "@/repositories/interfaces";

/**
 * Supabase implementation of MatchRepository
 */
export class SupabaseMatchRepository implements MatchRepository {
  constructor(
    private supabase: SupabaseClient,
    private organizationId: string
  ) {}

  /**
   * List matches
   */
  async list(
    clubId: string,
    params?: MatchListParams
  ): Promise<ListResult<Match>> {
    try {
      let query = this.supabase
        .from("matches")
        .select("*", { count: "exact" })
        .eq("organization_id", this.organizationId);

      // Apply status filter
      if (params?.status) {
        query = query.eq("status", params.status);
      } else {
        // Default: show all non-archived
        query = query.neq("status", "ARCHIVED");
      }

      // Apply sorting
      query = query.order("match_date", { ascending: false });

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
        data: (data || []).map((m) => this.mapFromDatabase(m)),
        total,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      safeError("Failed to list matches:", error);
      throw error;
    }
  }

  /**
   * Get match by ID
   */
  async getById(id: string): Promise<Match | null> {
    try {
      const { data, error } = await this.supabase
        .from("matches")
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
      safeError("Failed to fetch match:", error);
      throw error;
    }
  }

  /**
   * Create match
   */
  async create(clubId: string, input: CreateMatchInput): Promise<Match> {
    try {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from("matches")
        .insert({
          id,
          organization_id: this.organizationId,
          team_id: input.teamId,
          competition_id: input.competitionId || undefined,
          opponent_name: input.lawan,
          match_date: input.tanggal,
          score_home: input.skorHome || null,
          score_away: input.skorAway || null,
          venue: this.mapVenueToDatabase(input.venue),
          status: "SCHEDULED",
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
      safeError("Failed to create match:", error);
      throw error;
    }
  }

  /**
   * Update match
   */
  async update(id: string, input: UpdateMatchInput): Promise<Match> {
    try {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (input.lawan !== undefined) payload['opponent_name'] = input.lawan;
      if (input.tanggal !== undefined) payload['match_date'] = input.tanggal;
      if (input.skorHome !== undefined) payload['score_home'] = input.skorHome;
      if (input.skorAway !== undefined) payload['score_away'] = input.skorAway;
      if (input.venue !== undefined) payload['venue'] = this.mapVenueToDatabase(input.venue);

      // Update status if scores are explicitly set.
      // `!= null` catches both undefined and null — required for exactOptionalPropertyTypes.
      const hasScores = input.skorHome != null && input.skorAway != null;
      if (hasScores) {
        payload['status'] = "COMPLETED";
      } else if (input.skorHome === null && input.skorAway === null) {
        // Explicitly cleared scores → revert to SCHEDULED (if not CANCELLED/ARCHIVED)
        if (payload['status'] === undefined) {
          payload['status'] = "SCHEDULED";
        }
      }

      const { data, error } = await this.supabase
        .from("matches")
        .update(payload)
        .eq("id", id)
        .eq("organization_id", this.organizationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Match not found");
      }

      return this.mapFromDatabase(data);
    } catch (error) {
      safeError("Failed to update match:", error);
      throw error;
    }
  }

  /**
   * Delete match (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("matches")
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
      safeError("Failed to delete match:", error);
      throw error;
    }
  }

  /**
   * Get match result
   */
  async getResult(matchId: string): Promise<MatchResult> {
    try {
      const match = await this.getById(matchId);
      if (!match) {
        throw new Error("Match not found");
      }

      if (match.skorHome === null || match.skorAway === null) {
        return "upcoming";
      }

      const isHome = match.venue === "Kandang" || match.venue === "Netral";
      const homeForUs = isHome ? match.skorHome : match.skorAway;
      const awayForUs = isHome ? match.skorAway : match.skorHome;

      if (homeForUs === awayForUs) return "draw";
      return homeForUs > awayForUs ? "win" : "loss";
    } catch (error) {
      safeError("Failed to get match result:", error);
      throw error;
    }
  }

  /**
   * Get record statistics (W-D-L, GF-GA)
   */
  async getRecordStats(clubId: string, season?: string): Promise<MatchRecordStats> {
    try {
      const { data, error } = await this.supabase
        .from("matches")
        .select("*")
        .eq("organization_id", this.organizationId)
        .eq("status", "COMPLETED");

      if (error) {
        throw error;
      }

      let w = 0, d = 0, l = 0, gf = 0, ga = 0;

      for (const match of data || []) {
        if (match['score_home'] === null || match['score_away'] === null) continue;

        const isHome = match['venue'] === "HOME" || match['venue'] === "NEUTRAL";
        const ourGoals = isHome ? match['score_home'] : match['score_away'];
        const theirGoals = isHome ? match['score_away'] : match['score_home'];

        gf += ourGoals;
        ga += theirGoals;

        if (ourGoals > theirGoals) w++;
        else if (ourGoals === theirGoals) d++;
        else l++;
      }

      return { w, d, l, gf, ga };
    } catch (error) {
      safeError("Failed to get record stats:", error);
      throw error;
    }
  }

  /**
   * Get upcoming matches
   */
  async getUpcoming(clubId: string): Promise<Match[]> {
    try {
      const { data, error } = await this.supabase
        .from("matches")
        .select("*")
        .eq("organization_id", this.organizationId)
        .eq("status", "SCHEDULED")
        .gt("match_date", new Date().toISOString().split("T")[0])
        .order("match_date", { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []).map((m) => this.mapFromDatabase(m));
    } catch (error) {
      safeError("Failed to get upcoming matches:", error);
      throw error;
    }
  }

  /**
   * Get past matches
   */
  async getPast(clubId: string): Promise<Match[]> {
    try {
      const { data, error } = await this.supabase
        .from("matches")
        .select("*")
        .eq("organization_id", this.organizationId)
        .eq("status", "COMPLETED")
        .order("match_date", { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map((m) => this.mapFromDatabase(m));
    } catch (error) {
      safeError("Failed to get past matches:", error);
      throw error;
    }
  }

  /**
   * Map venue to database format
   */
  private mapVenueToDatabase(venue: string): string {
    const venueMap: Record<string, string> = {
      "Kandang": "HOME",
      "Tandang": "AWAY",
      "Netral": "NEUTRAL",
      "HOME": "HOME",
      "AWAY": "AWAY",
      "NEUTRAL": "NEUTRAL",
    };
    return venueMap[venue] || venue;
  }

  /**
   * Map venue from database format
   */
  private mapVenueFromDatabase(venue: string): "Kandang" | "Tandang" | "Netral" {
    const venueMap: Record<string, any> = {
      "HOME": "Kandang",
      "AWAY": "Tandang",
      "NEUTRAL": "Netral",
    };
    return venueMap[venue] || "Netral";
  }

  /**
   * Map database format to application format
   */
  private mapFromDatabase(row: any): Match {
    return {
      id: row['id'],
      clubId: this.organizationId,
      competitionId: row['competition_id'],
      competitionName: "", // TODO: Join with competitions table
      lawan: row['opponent_name'],
      tanggal: row['match_date'],
      skorHome: row['score_home'],
      skorAway: row['score_away'],
      venue: this.mapVenueFromDatabase(row['venue']),
      createdAt: row['created_at'],
      updatedAt: row['updated_at'],
    };
  }
}
