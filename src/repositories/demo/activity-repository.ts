/**
 * Demo Activity Repository
 */
import type { ActivityLog } from "@/repositories/interfaces";
import type { ActivityRepository } from "@/repositories/interfaces";
import { DemoStorage } from "./storage";

export class DemoActivityRepository implements ActivityRepository {
  constructor(private storage: DemoStorage) {
    if (!this.storage.has("activities")) {
      this.storage.set("activities", []);
    }
  }

  async list(clubId: string): Promise<ActivityLog[]> {
    return this.storage.get<ActivityLog[]>("activities", undefined, [])
      .filter((a) => a.clubId === clubId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async create(activity: Omit<ActivityLog, "id" | "createdAt">): Promise<ActivityLog> {
    const allActivities = this.storage.get<ActivityLog[]>("activities", undefined, []);
    const newActivity: ActivityLog = {
      ...activity,
      id: `act-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    allActivities.push(newActivity);
    this.storage.set("activities", allActivities);
    return newActivity;
  }

  async getByEntity(clubId: string, entity: string, entityId: string): Promise<ActivityLog[]> {
    return this.storage.get<ActivityLog[]>("activities", undefined, [])
      .filter((a) => a.clubId === clubId && a.entity === entity && a.entityId === entityId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
