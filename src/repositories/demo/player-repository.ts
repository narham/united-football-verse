/**
 * Demo Player Repository
 * Implements PlayerRepository interface using demo data + localStorage persistence
 * This is the first vertical slice of the repository pattern
 */

import type {
  Player,
  PlayerListParams,
  CreatePlayerInput,
  UpdatePlayerInput,
  ListResult,
  PlayerPerformanceRating,
  SeasonStat,
} from "@/repositories/interfaces";
import type { PlayerRepository } from "@/repositories/interfaces";
import { players as initialPlayers } from "@/lib/demo-data";
import { DemoStorage } from "./storage";

export class DemoPlayerRepository implements PlayerRepository {
  private storage: DemoStorage;

  constructor(storage: DemoStorage) {
    this.storage = storage;
    // Initialize player storage with demo data if not already initialized
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    if (!this.storage.has("players")) {
      // Initialize with demo players
      this.storage.set("players", initialPlayers);
    }
  }

  /**
   * Get all players with optional filtering and search
   */
  async list(clubId: string, params?: PlayerListParams): Promise<ListResult<Player>> {
    const allPlayers = this.storage.get<Player[]>("players", undefined, []);
    
    // Filter by club
    let filtered = allPlayers.filter((p) => p.clubId === clubId);

    // Apply search
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.football_id.toLowerCase().includes(search)
      );
    }

    // Apply position filter
    if (params?.position) {
      filtered = filtered.filter((p) => p.posisi === params.position);
    }

    // Apply status filter
    if (params?.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }

    // Apply pagination
    const offset = params?.offset || 0;
    const limit = params?.limit || 20;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      data: paginated,
      total: filtered.length,
      hasMore: offset + limit < filtered.length,
    };
  }

  /**
   * Get single player by ID
   */
  async getById(id: string): Promise<Player | null> {
    const allPlayers = this.storage.get<Player[]>("players", undefined, []);
    return allPlayers.find((p) => p.id === id) || null;
  }

  /**
   * Get player by football ID
   */
  async getByFootballId(footballId: string): Promise<Player | null> {
    const allPlayers = this.storage.get<Player[]>("players", undefined, []);
    return allPlayers.find((p) => p.football_id === footballId) || null;
  }

  /**
   * Create new player
   */
  async create(clubId: string, input: CreatePlayerInput): Promise<Player> {
    const allPlayers = this.storage.get<Player[]>("players", undefined, []);

    // Check for duplicate football ID (should not happen in demo, but good practice)
    const exists = allPlayers.some((p) => 
      p.clubId === clubId && 
      p.name.toLowerCase() === input.name.toLowerCase()
    );

    if (exists) {
      throw new Error("Player dengan nama yang sama sudah ada di klub ini");
    }

    // Generate new player ID
    const newId = `p${Date.now()}`;

    // Generate football ID (format: BID-YY-CLUB-NNNN)
    const footballId = this.generateFootballId(clubId, allPlayers.filter(p => p.clubId === clubId));

    // Create new player
    const fotoUrl = input.fotoUrl !== undefined ? input.fotoUrl : undefined;
    const citizenship = input.citizenship !== undefined ? input.citizenship : undefined;
    const newPlayer: Player = {
      id: newId,
      clubId,
      football_id: footballId,
      name: input.name,
      posisi: input.posisi,
      nomor: input.nomor,
      tanggalLahir: input.tanggalLahir,
      status: input.status,
      tinggi: input.tinggi,
      berat: input.berat,
      kaki: input.kaki,
      ...(fotoUrl !== undefined && { fotoUrl }),
      ...(citizenship !== undefined && { citizenship }),
      stats: [
        { season: "2025/2026", apps: 0, goals: 0, assists: 0, minutes: 0 },
        { season: "2024/2025", apps: 0, goals: 0, assists: 0, minutes: 0 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to storage
    allPlayers.push(newPlayer);
    this.storage.set("players", allPlayers);

    // Log activity
    this.logActivity(clubId, "create", "Player", newPlayer.id, newPlayer.name);

    // Create notification
    this.createNotification(clubId, `Pemain baru: ${newPlayer.name}`, "Pemain baru telah ditambahkan ke roster");

    return newPlayer;
  }

  /**
   * Update player
   */
  async update(id: string, input: UpdatePlayerInput): Promise<Player> {
    const allPlayers = this.storage.get<Player[]>("players", undefined, []);
    const playerIndex = allPlayers.findIndex((p) => p.id === id);

    if (playerIndex === -1) {
      throw new Error("Pemain tidak ditemukan");
    }

    const player = allPlayers[playerIndex]!;
    const oldData = JSON.stringify(player);
    const fotoUrl = input.fotoUrl !== undefined ? input.fotoUrl : player.fotoUrl;
    const citizenship = input.citizenship !== undefined ? input.citizenship : player.citizenship;

    // Update player (note: football_id is immutable)
    const updated: Player = {
      id: player.id,
      clubId: player.clubId,
      football_id: player.football_id,
      name: input.name ?? player.name,
      posisi: input.posisi ?? player.posisi,
      nomor: input.nomor ?? player.nomor,
      tanggalLahir: input.tanggalLahir ?? player.tanggalLahir,
      status: input.status ?? player.status,
      tinggi: input.tinggi ?? player.tinggi,
      berat: input.berat ?? player.berat,
      kaki: input.kaki ?? player.kaki,
      ...(fotoUrl !== undefined && { fotoUrl }),
      ...(citizenship !== undefined && { citizenship }),
      stats: player.stats,
      createdAt: player.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    allPlayers[playerIndex] = updated;
    this.storage.set("players", allPlayers);

    // Log activity
    this.logActivity(player.clubId, "update", "Player", id, player.name, {
      before: oldData,
      after: JSON.stringify(updated),
    });

    return updated;
  }

  /**
   * Delete player
   */
  async delete(id: string): Promise<void> {
    const allPlayers = this.storage.get<Player[]>("players", undefined, []);
    const playerIndex = allPlayers.findIndex((p) => p.id === id);

    if (playerIndex === -1) {
      throw new Error("Pemain tidak ditemukan");
    }

    const player = allPlayers[playerIndex]!;
    allPlayers.splice(playerIndex, 1);
    this.storage.set("players", allPlayers);

    // Log activity
    this.logActivity(player.clubId, "delete", "Player", id, player.name);
  }

  /**
   * Get season stats for a player
   */
  async getStats(playerId: string, season: string): Promise<any> {
    const player = await this.getById(playerId);
    if (!player) return null;
    return player.stats.find((s: SeasonStat) => s.season === season) || {
      season,
      apps: 0,
      goals: 0,
      assists: 0,
      minutes: 0,
    };
  }

  /**
   * Calculate player performance rating
   */
  async getPerformanceRating(playerId: string, season = "2025/2026"): Promise<PlayerPerformanceRating> {
    const player = await this.getById(playerId);
    if (!player) {
      return { label: "Pemain tidak ditemukan", score: 0, grade: "-" };
    }

    const stat = player.stats.find((s: SeasonStat) => s.season === season);
    if (!stat || stat.apps === 0) {
      return { label: "Belum ada data", score: 0, grade: "-" };
    }

    // Simple formula: contribution per 90 minutes
    const per90 = (stat.minutes / 90) || 1;
    const goalAssistPer90 = (stat.goals * 3 + stat.assists * 2) / per90;
    const score = Math.min(100, Math.round(30 + goalAssistPer90 * 15 + stat.apps * 1.2));

    let grade: "A" | "B" | "C" | "D" | "E" | "-" = "-";
    if (score >= 85) grade = "A";
    else if (score >= 70) grade = "B";
    else if (score >= 55) grade = "C";
    else if (score >= 40) grade = "D";
    else grade = "E";

    const labels: Record<string, string> = {
      A: "Luar Biasa",
      B: "Baik",
      C: "Cukup",
      D: "Perlu Perbaikan",
      E: "Belum Optimal",
      "-": "Belum ada data",
    };

    return {
      label: labels[grade] || "Tidak diketahui",
      score,
      grade,
    };
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  /**
   * Generate unique football ID
   */
  private generateFootballId(clubId: string, existingPlayers: Player[]): string {
    const clubCode = this.getClubCode(clubId);
    const year = new Date().getFullYear().toString().slice(2);

    // Find next sequence number
    const sequence = existingPlayers.length + 1;
    return `BID-${year}-${clubCode}-${String(sequence).padStart(4, "0")}`;
  }

  /**
   * Get club code from club ID
   */
  private getClubCode(clubId: string): string {
    // Map club IDs to codes
    const codes: Record<string, string> = {
      "club-garuda": "GRD",
      "club-harapan": "HRB",
      "club-elang": "ELP",
    };
    return codes[clubId] || "XX";
  }

  /**
   * Log activity (integration point with ActivityRepository)
   */
  private logActivity(
    clubId: string,
    action: "create" | "update" | "delete",
    entity: string,
    entityId: string,
    entityName: string,
    metadata?: Record<string, any>
  ): void {
    // Store activity in localStorage for activity log
    const activities = this.storage.get<any[]>("activities", undefined, []);
    if (activities) {
      activities.push({
        id: `act-${Date.now()}`,
        clubId,
        actor: "Anda", // In real app, from auth context
        action,
        entity,
        entityId,
        entityName,
        metadata,
        createdAt: new Date().toISOString(),
      });
      this.storage.set("activities", activities);
    }
  }

  /**
   * Create notification (integration point with NotificationRepository)
   */
  private createNotification(clubId: string, title: string, message: string): void {
    const notifications = this.storage.get<any[]>("notifications", undefined, []);
    if (notifications) {
      notifications.push({
        id: `notif-${Date.now()}`,
        clubId,
        title,
        message,
        type: "info",
        read: false,
        createdAt: new Date().toISOString(),
      });
      this.storage.set("notifications", notifications);
    }
  }
}
