/**
 * Demo Training Repository
 */
import type { TrainingSession, TrainingListParams, CreateTrainingInput, UpdateTrainingInput, Attendance, RecordAttendanceInput, ListResult } from "@/repositories/interfaces";
import type { TrainingRepository } from "@/repositories/interfaces";
import { trainingSessions as initialSessions } from "@/lib/demo-data";
import { DemoStorage } from "./storage";

export class DemoTrainingRepository implements TrainingRepository {
  constructor(private storage: DemoStorage, private clubId: string) {
    if (!this.storage.has("training_sessions")) {
      this.storage.set("training_sessions", initialSessions);
    }
    if (!this.storage.has("attendance")) {
      this.storage.set("attendance", []);
    }
  }

  async list(clubId: string, params?: TrainingListParams): Promise<ListResult<TrainingSession>> {
    let data = this.storage.get<TrainingSession[]>("training_sessions", undefined, [])
      .filter((t) => t.clubId === clubId);

    if (params?.search) {
      const search = params.search.toLowerCase();
      data = data.filter((t) => t.title.toLowerCase().includes(search));
    }

    const offset = params?.offset || 0;
    const limit = params?.limit || 20;

    return {
      data: data.slice(offset, offset + limit),
      total: data.length,
      hasMore: offset + limit < data.length,
    };
  }

  async getById(id: string): Promise<TrainingSession | null> {
    return this.storage.get<TrainingSession[]>("training_sessions", undefined, [])
      .find((t) => t.id === id && t.clubId === this.clubId) || null;
  }

  async create(clubId: string, input: CreateTrainingInput): Promise<TrainingSession> {
    const allSessions = this.storage.get<TrainingSession[]>("training_sessions", undefined, []);
    const newSession: TrainingSession = {
      id: `t${Date.now()}`,
      clubId,
      title: input.title,
      day: input.day,
      startTime: input.startTime,
      endTime: input.endTime,
      location: input.location,
      focus: input.focus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (input.teamId !== undefined) {
      newSession.teamId = input.teamId;
    }
    allSessions.push(newSession);
    this.storage.set("training_sessions", allSessions);
    return newSession;
  }

  async update(id: string, input: UpdateTrainingInput): Promise<TrainingSession> {
    const allSessions = this.storage.get<TrainingSession[]>("training_sessions", undefined, []);
    const index = allSessions.findIndex((t) => t.id === id && t.clubId === this.clubId);
    if (index === -1) throw new Error("Training session not found");
    const old = allSessions[index]!;
    const updated: TrainingSession = {
      id: old.id,
      clubId: old.clubId,
      title: input.title ?? old.title,
      day: input.day ?? old.day,
      startTime: input.startTime ?? old.startTime,
      endTime: input.endTime ?? old.endTime,
      location: input.location ?? old.location,
      focus: input.focus ?? old.focus,
      createdAt: old.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (input.teamId !== undefined) {
      updated.teamId = input.teamId;
    } else if (old.teamId !== undefined) {
      updated.teamId = old.teamId;
    }
    allSessions[index] = updated;
    this.storage.set("training_sessions", allSessions);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const allSessions = this.storage.get<TrainingSession[]>("training_sessions", undefined, []);
    const index = allSessions.findIndex((t) => t.id === id && t.clubId === this.clubId);
    if (index !== -1) {
      allSessions.splice(index, 1);
      this.storage.set("training_sessions", allSessions);
    }
  }

  async recordAttendance(input: RecordAttendanceInput): Promise<Attendance> {
    const allAttendance = this.storage.get<Attendance[]>("attendance", undefined, []);
    
    const existing = allAttendance.find(
      (a) => a.trainingId === input.trainingId && a.playerId === input.playerId && a.date === input.date
    );

    if (existing) {
      existing.status = input.status;
      existing.updatedAt = new Date().toISOString();
    } else {
      const newAttendance: Attendance = {
        id: `att-${Date.now()}`,
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      allAttendance.push(newAttendance);
    }

    this.storage.set("attendance", allAttendance);
    return existing || allAttendance[allAttendance.length - 1]!;
  }

  async getAttendance(trainingId: string): Promise<Attendance[]> {
    return this.storage.get<Attendance[]>("attendance", undefined, [])
      .filter((a) => a.trainingId === trainingId);
  }

  async getAttendanceByDate(clubId: string, date: string): Promise<Attendance[]> {
    return this.storage.get<Attendance[]>("attendance", undefined, [])
      .filter((a) => a.date === date);
  }
}
