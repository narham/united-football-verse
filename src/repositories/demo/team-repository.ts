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
  constructor(private storage: DemoStorage) {
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
      .find((t) => t.id === id) || null;
  }

  async create(clubId: string, input: CreateTeamInput): Promise<Team> {
    const allTeams = this.storage.get<Team[]>("teams", undefined, []);
    const newTeam: Team = {
      id: `tm-${Date.now()}`,
      clubId,
      ...input,
      status: "Aktif",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allTeams.push(newTeam);
    this.storage.set("teams", allTeams);
    return newTeam;
  }

  async update(id: string, input: UpdateTeamInput): Promise<Team> {
    const allTeams = this.storage.get<Team[]>("teams", undefined, []);
    const index = allTeams.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Team not found");
    const old = allTeams[index]!;
    const coach = input.coach !== undefined ? input.coach : old.coach;
    const updated: Team = {
      id: old.id,
      clubId: old.clubId,
      name: input.name ?? old.name,
      ageGroup: input.ageGroup ?? old.ageGroup,
      season: input.season ?? old.season,
      ...(coach !== undefined && { coach }),
      status: old.status,
      createdAt: old.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allTeams[index] = updated;
    this.storage.set("teams", allTeams);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const allTeams = this.storage.get<Team[]>("teams", undefined, []);
    const index = allTeams.findIndex((t) => t.id === id);
    if (index !== -1) {
      allTeams.splice(index, 1);
      this.storage.set("teams", allTeams);
    }
  }

  async getStats(teamId: string, season: string): Promise<TeamStats> {
    // Derived from matches (simplified for demo)
    return { apps: 5, goals: 12, assists: 8 };
  }
}
