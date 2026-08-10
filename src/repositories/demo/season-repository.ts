/**
 * Demo Season Repository
 */
import type { Season, CreateSeasonInput, UpdateSeasonInput } from "@/repositories/interfaces";
import type { SeasonRepository } from "@/repositories/interfaces";
import { DemoStorage } from "./storage";

const initialSeasons: Season[] = [
  { id: "ssn-1", clubId: "club-garuda", name: "2025/2026", startDate: "2025-01-01", endDate: "2025-12-31", status: "Aktif", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "ssn-2", clubId: "club-garuda", name: "2026/2027", startDate: "2026-01-01", endDate: "2026-12-31", status: "Tidak Aktif", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export class DemoSeasonRepository implements SeasonRepository {
  constructor(private storage: DemoStorage, private clubId: string) {
    if (!this.storage.has("seasons")) {
      this.storage.set("seasons", initialSeasons);
    }
  }

  async list(clubId: string): Promise<Season[]> {
    return this.storage.get<Season[]>("seasons", undefined, [])
      .filter((s) => s.clubId === clubId);
  }

  async getById(id: string): Promise<Season | null> {
    return this.storage.get<Season[]>("seasons", undefined, [])
      .find((s) => s.id === id && s.clubId === this.clubId) || null;
  }

  async create(clubId: string, input: CreateSeasonInput): Promise<Season> {
    const allSeasons = this.storage.get<Season[]>("seasons", undefined, []);
    const newSeason: Season = {
      id: `ssn-${Date.now()}`,
      clubId,
      ...input,
      status: "Tidak Aktif",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allSeasons.push(newSeason);
    this.storage.set("seasons", allSeasons);
    return newSeason;
  }

  async update(id: string, input: UpdateSeasonInput): Promise<Season> {
    const allSeasons = this.storage.get<Season[]>("seasons", undefined, []);
    const index = allSeasons.findIndex((s) => s.id === id && s.clubId === this.clubId);
    if (index === -1) throw new Error("Season not found");
    const old = allSeasons[index]!;
    const updated: Season = {
      id: old.id,
      clubId: old.clubId,
      name: input.name ?? old.name,
      startDate: input.startDate ?? old.startDate,
      endDate: input.endDate ?? old.endDate,
      status: input.status ?? old.status,
      createdAt: old.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allSeasons[index] = updated;
    this.storage.set("seasons", allSeasons);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const allSeasons = this.storage.get<Season[]>("seasons", undefined, []);
    const index = allSeasons.findIndex((s) => s.id === id && s.clubId === this.clubId);
    if (index !== -1) {
      allSeasons.splice(index, 1);
      this.storage.set("seasons", allSeasons);
    }
  }

  async getActive(clubId: string): Promise<Season | null> {
    return this.storage.get<Season[]>("seasons", undefined, [])
      .find((s) => s.clubId === clubId && s.status === "Aktif") || null;
  }

  async setActive(id: string): Promise<void> {
    const allSeasons = this.storage.get<Season[]>("seasons", undefined, []);
    const season = allSeasons.find((s) => s.id === id && s.clubId === this.clubId);
    if (!season) throw new Error("Season not found");

    for (const s of allSeasons) {
      if (s.clubId === season.clubId) {
        s.status = s.id === id ? "Aktif" : "Tidak Aktif";
        s.updatedAt = new Date().toISOString();
      }
    }
    this.storage.set("seasons", allSeasons);
  }
}
