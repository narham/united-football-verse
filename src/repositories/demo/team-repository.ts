/**
 * Demo Team Repository
 */
import type { Team, CreateTeamInput, UpdateTeamInput, TeamStats } from "@/repositories/interfaces";
import type { TeamRepository } from "@/repositories/interfaces";
import { DemoStorage } from "./storage";

const initialTeams: Team[] = [
  { id: "tm-1", clubId: "club-garuda", name: "U-19 Main", ageGroup: "U-19", season: "2026", coach: "Drs. H. Suherman, M.Pd.", status: "Aktif", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "tm-2", clubId: "club-garuda", name: "U-17 Cadangan", ageGroup: "U-17", season: "2026", coach: "Asep Sutisna", status: "Aktif", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export class DemoTeamRepository implements TeamRepository {
  private storage: DemoStorage;
  private clubId: string;

  constructor(storage: DemoStorage, clubId: string) {
    this.storage = storage;
    this.clubId = clubId;
    if (!this.storage.has("teams")) {
      this.storage.set("teams", initialTeams);
    }
  }

  async list(clubId: string): Promise<Team[]> {
    return this.storage.get<Team[]>("teams", undefined, [])
      .filter((t) => t.clubId === clubId);
  }

  async getById(id: string): Promise<Team | null> {
    return this.storage.get<Team[]>("teams", undefined, [])
      .find((t) => t.id === id && t.clubId === this.clubId) || null;
  }

  async create(clubId: string, input: CreateTeamInput): Promise<Team> {
    const allTeams = this.storage.get<Team[]>("teams", undefined, []);
    const newTeam: Team = {
      id: `tm-${Date.now()}`,
      clubId,
      name: input.name,
      ageGroup: input.ageGroup || input.category || "U-17",
      season: input.season || input.seasonId || "2026",
      status: "Aktif",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (input.coach !== undefined) {
      newTeam.coach = input.coach;
    }
    allTeams.push(newTeam);
    this.storage.set("teams", allTeams);
    return newTeam;
  }

  async update(id: string, input: UpdateTeamInput): Promise<Team> {
    const allTeams = this.storage.get<Team[]>("teams", undefined, []);
    const index = allTeams.findIndex((t) => t.id === id && t.clubId === this.clubId);
    if (index === -1) throw new Error("Team not found");
    const old = allTeams[index]!;
    const coach = input.coach !== undefined ? input.coach : old.coach;
    const category = input.category !== undefined ? input.category : (old as any).category;
    const seasonId = input.seasonId !== undefined ? input.seasonId : (old as any).seasonId;
    const updated: Team = {
      id: old.id,
      clubId: old.clubId,
      name: input.name ?? old.name,
      ageGroup: input.ageGroup ?? old.ageGroup,
      season: input.season ?? old.season,
      ...(category !== undefined && { category }),
      ...(seasonId !== undefined && { seasonId }),
      ...(coach !== undefined && { coach }),
      status: input.status !== undefined ? (input.status as "Aktif" | "Tidak Aktif") : old.status,
      createdAt: old.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allTeams[index] = updated;
    this.storage.set("teams", allTeams);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const allTeams = this.storage.get<Team[]>("teams", undefined, []);
    const index = allTeams.findIndex((t) => t.id === id && t.clubId === this.clubId);
    if (index !== -1) {
      allTeams.splice(index, 1);
      this.storage.set("teams", allTeams);
    }
  }

  async getStats(teamId: string, season: string): Promise<TeamStats> {
    return { apps: 5, goals: 12, assists: 8 };
  }
}
