/**
 * Demo Competition Repository
 */
import type { Competition, CreateCompetitionInput, UpdateCompetitionInput } from "@/repositories/interfaces";
import type { CompetitionRepository } from "@/repositories/interfaces";
import { competitions as initialCompetitions } from "@/lib/demo-data";
import { DemoStorage } from "./storage";

export class DemoCompetitionRepository implements CompetitionRepository {
  constructor(private storage: DemoStorage, private clubId: string) {
    if (!this.storage.has("competitions")) {
      this.storage.set("competitions", initialCompetitions);
    }
  }

  async list(clubId: string): Promise<Competition[]> {
    return this.storage.get<Competition[]>("competitions", undefined, [])
      .filter((c) => c.clubId === clubId);
  }

  async getById(id: string): Promise<Competition | null> {
    return this.storage.get<Competition[]>("competitions", undefined, [])
      .find((c) => c.id === id && c.clubId === this.clubId) || null;
  }

  async create(clubId: string, input: CreateCompetitionInput): Promise<Competition> {
    const allCompetitions = this.storage.get<Competition[]>("competitions", undefined, []);
    const newComp: Competition = {
      id: `cmp-${Date.now()}`,
      clubId,
      name: input.name,
      season: input.season || input.seasonId || "2026/2027",
      level: input.level || "Kompetisi",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allCompetitions.push(newComp);
    this.storage.set("competitions", allCompetitions);
    return newComp;
  }

  async update(id: string, input: UpdateCompetitionInput): Promise<Competition> {
    const allCompetitions = this.storage.get<Competition[]>("competitions", undefined, []);
    const index = allCompetitions.findIndex((c) => c.id === id && c.clubId === this.clubId);
    if (index === -1) throw new Error("Competition not found");
    const old = allCompetitions[index]!;
    const updated: Competition = {
      id: old.id,
      clubId: old.clubId,
      name: input.name ?? old.name,
      season: (input.season ?? input.seasonId) ?? old.season,
      level: input.level ?? old.level,
      createdAt: old.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allCompetitions[index] = updated;
    this.storage.set("competitions", allCompetitions);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const allCompetitions = this.storage.get<Competition[]>("competitions", undefined, []);
    const index = allCompetitions.findIndex((c) => c.id === id && c.clubId === this.clubId);
    if (index !== -1) {
      allCompetitions.splice(index, 1);
      this.storage.set("competitions", allCompetitions);
    }
  }
}
