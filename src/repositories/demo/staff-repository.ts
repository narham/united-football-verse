/**
 * Demo Staff Repository
 */
import type { Staff, StaffListParams, CreateStaffInput, UpdateStaffInput, ListResult } from "@/repositories/interfaces";
import type { StaffRepository } from "@/repositories/interfaces";
import { staff as initialStaff } from "@/lib/demo-data";
import { DemoStorage } from "./storage";

export class DemoStaffRepository implements StaffRepository {
  constructor(private storage: DemoStorage) {
    if (!this.storage.has("staff")) {
      this.storage.set("staff", initialStaff);
    }
  }

  async list(clubId: string, params?: StaffListParams): Promise<ListResult<Staff>> {
    let data = this.storage.get<Staff[]>("staff", undefined, [])
      .filter((s) => s.clubId === clubId);

    if (params?.search) {
      const search = params.search.toLowerCase();
      data = data.filter((s) => 
        s.name.toLowerCase().includes(search) || 
        s.role.toLowerCase().includes(search)
      );
    }

    if (params?.role) {
      data = data.filter((s) => s.role === params.role);
    }

    const offset = params?.offset || 0;
    const limit = params?.limit || 20;

    return {
      data: data.slice(offset, offset + limit),
      total: data.length,
      hasMore: offset + limit < data.length,
    };
  }

  async getById(id: string): Promise<Staff | null> {
    return this.storage.get<Staff[]>("staff", undefined, [])
      .find((s) => s.id === id) || null;
  }

  async create(clubId: string, input: CreateStaffInput): Promise<Staff> {
    const allStaff = this.storage.get<Staff[]>("staff", undefined, []);
    const newStaff: Staff = {
      id: `st-${Date.now()}`,
      clubId,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allStaff.push(newStaff);
    this.storage.set("staff", allStaff);
    return newStaff;
  }

  async update(id: string, input: UpdateStaffInput): Promise<Staff> {
    const allStaff = this.storage.get<Staff[]>("staff", undefined, []);
    const index = allStaff.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Staff not found");
    const old = allStaff[index]!;
    const telephone = input.telephone !== undefined ? input.telephone : old.telephone;
    const updated: Staff = {
      id: old.id,
      clubId: old.clubId,
      name: input.name ?? old.name,
      role: input.role ?? old.role,
      ...(telephone !== undefined && { telephone }),
      createdAt: old.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allStaff[index] = updated;
    this.storage.set("staff", allStaff);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const allStaff = this.storage.get<Staff[]>("staff", undefined, []);
    const index = allStaff.findIndex((s) => s.id === id);
    if (index !== -1) {
      allStaff.splice(index, 1);
      this.storage.set("staff", allStaff);
    }
  }
}
