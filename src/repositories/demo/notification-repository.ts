/**
 * Demo Notification Repository
 */
import type { Notification } from "@/repositories/interfaces";
import type { NotificationRepository } from "@/repositories/interfaces";
import { DemoStorage } from "./storage";

export class DemoNotificationRepository implements NotificationRepository {
  constructor(private storage: DemoStorage) {
    if (!this.storage.has("notifications")) {
      this.storage.set("notifications", []);
    }
  }

  async list(clubId: string): Promise<Notification[]> {
    return this.storage.get<Notification[]>("notifications", undefined, [])
      .filter((n) => n.clubId === clubId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getById(id: string): Promise<Notification | null> {
    return this.storage.get<Notification[]>("notifications", undefined, [])
      .find((n) => n.id === id) || null;
  }

  async create(clubId: string, notification: Omit<Notification, "id" | "createdAt">): Promise<Notification> {
    const allNotifications = this.storage.get<Notification[]>("notifications", undefined, []);
    const newNotif: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    allNotifications.push(newNotif);
    this.storage.set("notifications", allNotifications);
    return newNotif;
  }

  async markAsRead(id: string): Promise<Notification> {
    const allNotifications = this.storage.get<Notification[]>("notifications", undefined, []);
    const notification = allNotifications.find((n) => n.id === id);
    if (!notification) throw new Error("Notification not found");
    notification.read = true;
    this.storage.set("notifications", allNotifications);
    return notification;
  }

  async markAllAsRead(clubId: string): Promise<void> {
    const allNotifications = this.storage.get<Notification[]>("notifications", undefined, []);
    for (const n of allNotifications) {
      if (n.clubId === clubId) {
        n.read = true;
      }
    }
    this.storage.set("notifications", allNotifications);
  }

  async delete(id: string): Promise<void> {
    const allNotifications = this.storage.get<Notification[]>("notifications", undefined, []);
    const index = allNotifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      allNotifications.splice(index, 1);
      this.storage.set("notifications", allNotifications);
    }
  }

  async getUnreadCount(clubId: string): Promise<number> {
    return this.storage.get<Notification[]>("notifications", undefined, [])
      .filter((n) => n.clubId === clubId && !n.read)
      .length;
  }
}
