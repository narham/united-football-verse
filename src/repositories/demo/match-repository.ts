/**
 * Demo Match Repository
 */
import type { Match, MatchListParams, CreateMatchInput, UpdateMatchInput, MatchResult, MatchRecordStats, ListResult } from "@/repositories/interfaces";
import type { MatchRepository } from "@/repositories/interfaces";
import { matches as initialMatches, matchResult } from "@/lib/demo-data";
import { DemoStorage } from "./storage";

export class DemoMatchRepository implements MatchRepository {
  constructor(private storage: DemoStorage) {
    if (!this.storage.has("matches")) {
      this.storage.set("matches", initialMatches);
    }
  }

  async list(clubId: string, params?: MatchListParams): Promise<ListResult<Match>> {
    let data = this.storage.get<Match[]>("matches", undefined, [])
      .filter((m) => m.clubId === clubId);

    if (params?.competitionId) {
      data = data.filter((m) => m.competitionId === params.competitionId);
    }

    if (params?.status === "upcoming") {
      data = data.filter((m) => m.skorHome === null || m.skorAway === null);
    } else if (params?.status === "completed") {
      data = data.filter((m) => m.skorHome !== null && m.skorAway !== null);
    }

    const offset = params?.offset || 0;
    const limit = params?.limit || 20;

    return {
      data: data.slice(offset, offset + limit),
      total: data.length,
      hasMore: offset + limit < data.length,
    };
  }

  async getById(id: string): Promise<Match | null> {
    return this.storage.get<Match[]>("matches", undefined, [])
      .find((m) => m.id === id) || null;
  }

  async create(clubId: string, input: CreateMatchInput): Promise<Match> {
    const allMatches = this.storage.get<Match[]>("matches", undefined, []);
    const newMatch: Match = {
      id: `m${Date.now()}`,
      clubId,
      ...input,
      skorHome: null,
      skorAway: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allMatches.push(newMatch);
    this.storage.set("matches", allMatches);
    return newMatch;
  }

  async update(id: string, input: UpdateMatchInput): Promise<Match> {
    const allMatches = this.storage.get<Match[]>("matches", undefined, []);
    const index = allMatches.findIndex((m) => m.id === id);
    if (index === -1) throw new Error("Match not found");
    const old = allMatches[index]!;
    const updated: Match = {
      id: old.id,
      clubId: old.clubId,
      competitionId: old.competitionId,
      competitionName: old.competitionName,
      lawan: input.lawan ?? old.lawan,
      tanggal: input.tanggal ?? old.tanggal,
      venue: input.venue ?? old.venue,
      skorHome: input.skorHome !== undefined ? input.skorHome : old.skorHome,
      skorAway: input.skorAway !== undefined ? input.skorAway : old.skorAway,
      createdAt: old.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allMatches[index] = updated;
    this.storage.set("matches", allMatches);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const allMatches = this.storage.get<Match[]>("matches", undefined, []);
    const index = allMatches.findIndex((m) => m.id === id);
    if (index !== -1) {
      allMatches.splice(index, 1);
      this.storage.set("matches", allMatches);
    }
  }

  async getResult(matchId: string): Promise<MatchResult> {
    const match = await this.getById(matchId);
    if (!match) throw new Error("Match not found");
    return matchResult(match);
  }

  async getRecordStats(clubId: string, season?: string): Promise<MatchRecordStats> {
    const matches = this.storage.get<Match[]>("matches", undefined, [])
      .filter((m) => m.clubId === clubId && (m.skorHome !== null && m.skorAway !== null));

    let w = 0, d = 0, l = 0, gf = 0, ga = 0;

    for (const m of matches) {
      const result = matchResult(m);
      if (result === "upcoming") continue;
      if (result === "win") w++;
      else if (result === "draw") d++;
      else l++;

      const isHome = m.venue === "Kandang" || m.venue === "Netral";
      const ourGoals = isHome ? (m.skorHome ?? 0) : (m.skorAway ?? 0);
      const conceded = isHome ? (m.skorAway ?? 0) : (m.skorHome ?? 0);
      gf += ourGoals;
      ga += conceded;
    }

    return { w, d, l, gf, ga };
  }

  async getUpcoming(clubId: string): Promise<Match[]> {
    return this.storage.get<Match[]>("matches", undefined, [])
      .filter((m) => m.clubId === clubId && (m.skorHome === null || m.skorAway === null));
  }

  async getPast(clubId: string): Promise<Match[]> {
    return this.storage.get<Match[]>("matches", undefined, [])
      .filter((m) => m.clubId === clubId && m.skorHome !== null && m.skorAway !== null);
  }
}
