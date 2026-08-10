/**
 * Supabase Player Repository
 * 
 * Real persistence implementation using Supabase PostgreSQL.
 * Extends DemoPlayerRepository pattern with real database backend.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Player,
  PlayerListParams,
  CreatePlayerInput,
  UpdatePlayerInput,
  ListResult,
} from "@/repositories/interfaces";
import type { PlayerRepository } from "@/repositories/interfaces";

/**
 * Supabase implementation of PlayerRepository
 */
export class SupabasePlayerRepository implements PlayerRepository {
  constructor(private supabase: SupabaseClient, private clubId: string) {}

  async list(clubId: string, params?: PlayerListParams): Promise<ListResult<Player>> {
    // Ensure requesting clubId matches stored clubId (for safety)
    if (clubId !== this.clubId) {
      throw new Error("Unauthorized: club ID mismatch");
    }

    let query = this.supabase
      .from("players")
      .select("*", { count: "exact" })
      .eq("organization_id", this.clubId);

    // Apply search
    if (params?.search) {
      const search = params.search.toLowerCase();
      query = query.or(
        `nama.ilike.%${search}%,football_id.ilike.%${search}%`
      );
    }

    // Apply position filter
    if (params?.position) {
      query = query.eq("posisi", params.position);
    }

    // Apply status filter
    if (params?.status) {
      query = query.eq("status", params.status);
    }

    // Apply sorting
    query = query.order("nama", { ascending: true });

    // Apply pagination
    const offset = params?.offset || 0;
    const limit = params?.limit || 20;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list players: ${error.message}`);
    }

    const total = count || data?.length || 0;
    return {
      data: (data || []).map((p) => this.mapFromDatabase(p)),
      total,
      hasMore: offset + limit < total,
    };
  }

  async getById(id: string): Promise<Player | null> {
    const { data, error } = await this.supabase
      .from("players")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return null;
      }
      throw new Error(`Failed to fetch player: ${error.message}`);
    }

    return data ? this.mapFromDatabase(data) : null;
  }

  async create(clubId: string, input: CreatePlayerInput): Promise<Player> {
    // Ensure creating player for correct club
    if (clubId !== this.clubId) {
      throw new Error("Unauthorized: club ID mismatch");
    }

    const id = crypto.randomUUID();
    const footballId = this.generateFootballId();
    const now = new Date().toISOString();

    const playerData: any = {
      id,
      organization_id: this.clubId,
      football_id: footballId,
      nama: input.name,
      posisi: input.posisi,
      nomor: input.nomor,
      tgl_lahir: input.tanggalLahir,
      status: input.status,
      tinggi: input.tinggi,
      berat: input.berat,
      kaki: input.kaki,
      created_at: now,
      updated_at: now,
    };

    // Conditionally add optional properties
    if (input.citizenship !== undefined) {
      playerData.citizenship = input.citizenship;
    }
    if (input.fotoUrl !== undefined) {
      playerData.foto_url = input.fotoUrl;
    }

    const { error } = await this.supabase
      .from("players")
      .insert([playerData]);

    if (error) {
      throw new Error(`Failed to create player: ${error.message}`);
    }

    // Build and return the player object
    const player: any = {
      id,
      clubId: this.clubId,
      football_id: footballId,
      name: input.name,
      posisi: input.posisi,
      nomor: input.nomor,
      tanggalLahir: input.tanggalLahir,
      status: input.status,
      tinggi: input.tinggi,
      berat: input.berat,
      kaki: input.kaki,
      stats: [],
      createdAt: now,
      updatedAt: now,
    };

    // Only add optional properties if provided
    if (input.citizenship !== undefined) {
      player.citizenship = input.citizenship;
    }
    if (input.fotoUrl !== undefined) {
      player.fotoUrl = input.fotoUrl;
    }

    return player as Player;
  }

  async update(id: string, input: UpdatePlayerInput): Promise<Player> {
    const player = await this.getById(id);

    if (!player) {
      throw new Error("Pemain tidak ditemukan");
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only add fields that are explicitly provided
    if (input.name !== undefined) {
      updateData.nama = input.name;
    }
    if (input.posisi !== undefined) {
      updateData.posisi = input.posisi;
    }
    if (input.nomor !== undefined) {
      updateData.nomor = input.nomor;
    }
    if (input.tanggalLahir !== undefined) {
      updateData.tgl_lahir = input.tanggalLahir;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.tinggi !== undefined) {
      updateData.tinggi = input.tinggi;
    }
    if (input.berat !== undefined) {
      updateData.berat = input.berat;
    }
    if (input.kaki !== undefined) {
      updateData.kaki = input.kaki;
    }
    if (input.citizenship !== undefined) {
      updateData.citizenship = input.citizenship;
    }
    if (input.fotoUrl !== undefined) {
      updateData.foto_url = input.fotoUrl;
    }

    const { error } = await this.supabase
      .from("players")
      .update(updateData)
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to update player: ${error.message}`);
    }

    // Return updated player by merging changes
    const updated: any = {
      ...player,
      ...input,
      updatedAt: updateData.updated_at,
    };

    // Remove undefined values
    Object.keys(updated).forEach((key) => {
      if (updated[key] === undefined) {
        delete updated[key];
      }
    });

    return updated as Player;
  }

  async delete(id: string): Promise<void> {
    const player = await this.getById(id);

    if (!player) {
      throw new Error("Pemain tidak ditemukan");
    }

    const { error } = await this.supabase
      .from("players")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete player: ${error.message}`);
    }
  }

  async getByFootballId(footballId: string): Promise<Player | null> {
    const { data, error } = await this.supabase
      .from("players")
      .select("*")
      .eq("football_id", footballId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch player: ${error.message}`);
    }

    return data ? this.mapFromDatabase(data) : null;
  }

  // TODO(R-REG): Signature mismatch with interface PlayerRepository.getStats(playerId: string, season: string) — missing playerId and season params
  async getStats(): Promise<any> {
    // TODO: Implement stats retrieval
    return {};
  }

  // TODO(R-REG): Signature mismatch with interface PlayerRepository.getPerformanceRating(playerId: string, season?: string): Promise<PlayerPerformanceRating> — missing params, return type is `any` not PlayerPerformanceRating
  async getPerformanceRating(): Promise<any> {
    // TODO: Implement performance rating calculation
    return { label: "N/A", score: 0, grade: "-" };
  }

  /**
   * Generate unique Football ID
   * Format: BID-YYYY-XXX-0001 (where YYYY=birth year, XXX=club code, 0001=sequential)
   */
  private generateFootballId(): string {
    const year = new Date().getFullYear();
    const clubCode = "GRD"; // TODO: Get from club configuration
    const seq = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `BID-${year}-${clubCode}-${seq}`;
  }

  /**
   * Map database record to domain model
   */
  private mapFromDatabase(data: any): Player {
    const stats = data.stats || [];
    const player: any = {
      id: data.id,
      clubId: data.organization_id,
      football_id: data.football_id,
      name: data.nama,
      posisi: data.posisi,
      nomor: data.nomor,
      tanggalLahir: data.tgl_lahir,
      status: data.status,
      tinggi: data.tinggi,
      berat: data.berat,
      kaki: data.kaki,
      stats: Array.isArray(stats) ? stats : [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    // Only add optional properties if they exist
    if (data.citizenship !== null) {
      player.citizenship = data.citizenship;
    }
    if (data.foto_url !== null) {
      player.fotoUrl = data.foto_url;
    }

    return player as Player;
  }
}
