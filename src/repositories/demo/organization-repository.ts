/**
 * Demo Organization Repository
 */
import type { Club } from "@/repositories/interfaces";
import type { OrganizationRepository } from "@/repositories/interfaces";
import { club, clubs } from "@/lib/demo-data";
import { DemoStorage } from "./storage";

export class DemoOrganizationRepository implements OrganizationRepository {
  constructor(private storage: DemoStorage, private clubId: string) {
    if (!this.storage.has("clubs")) {
      this.storage.set("clubs", clubs);
    }
  }

  async getClub(clubId: string): Promise<Club | null> {
    return this.storage.get<Club[]>("clubs", undefined, [])
      .find((c) => c.id === clubId) || null;
  }

  async updateClub(clubId: string, clubUpdate: Partial<Club>): Promise<Club> {
    const allClubs = this.storage.get<Club[]>("clubs", undefined, []);
    const index = allClubs.findIndex((c) => c.id === clubId);
    if (index === -1) throw new Error("Club not found");
    const old = allClubs[index]!;
    const logoUrl = clubUpdate.logoUrl !== undefined ? clubUpdate.logoUrl : old.logoUrl;
    const footballOrgId = clubUpdate.footballOrgId !== undefined ? clubUpdate.footballOrgId : old.footballOrgId;
    const updated: Club = {
      id: old.id,
      name: clubUpdate.name ?? old.name,
      short: clubUpdate.short ?? old.short,
      city: clubUpdate.city ?? old.city,
      foundedYear: clubUpdate.foundedYear ?? old.foundedYear,
      season: clubUpdate.season ?? old.season,
      sport: clubUpdate.sport ?? old.sport,
      ...(logoUrl !== undefined && { logoUrl }),
      ...(footballOrgId !== undefined && { footballOrgId }),
    };
    allClubs[index] = updated;
    this.storage.set("clubs", allClubs);
    return updated;
  }

  async getClubs(): Promise<Club[]> {
    return this.storage.get<Club[]>("clubs", undefined, []);
  }
}
