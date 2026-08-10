/**
 * Demo Competition Repository
 */
import type { Competition, CreateCompetitionInput, UpdateCompetitionInput } from "@/repositories/interfaces";
import type { CompetitionRepository } from "@/repositories/interfaces";
import { competitions as initialCompetitions } from "@/lib/demo-data";
import { DemoStorage } from "./storage";

export class DemoCompetitionRepository implements CompetitionRepository {
  constructor(private storage: DemoStorage) {
    if (!this.storage.has("competitions")) {
      this.storage.set("competitions", initialCompetitions);
    }
  }

  async list(clubId: string): Promise<Competition[]> {
    return this.storage.get<Competition[]>("competitions", undefined, []);
  }

  async getById(id: string): Promise<Competition | null> {
    return this.storage.get<Competition[]>("competitions", undefined, [])
      .find((c) => c.id === id) || null;
  }

  async create(clubId: string, input: CreateCompetitionInput): Promise<Competition> {
    const allCompetitions = this.storage.get<Competition[]>("competitions", undefined, []);
    const newComp: Competition = {
      id: `cmp-${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allCompetitions.push(newComp);
    this.storage.set("competitions", allCompetitions);
    return newComp;
  }

  async update(id: string, input: UpdateCompetitionInput): Promise<Competition> {
    const allCompetitions = this.storage.get<Competition[]>("competitions", undefined, []);
    const index = allCompetitions.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Competition not found");
    const old = allCompetitions[index]!;
    const updated: Competition = {
      id: old.id,
      name: input.name ?? old.name,
      season: input.season ?? old.season,
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
    const index = allCompetitions.findIndex((c) => c.id === id);
    if (index !== -1) {
      allCompetitions.splice(index, 1);
      this.storage.set("competitions", allCompetitions);
    }
  }
}
