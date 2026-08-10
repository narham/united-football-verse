/**
 * Demo User Profile Repository
 * Simulates user profile storage using localStorage
 */

import type { UserProfile, UpdateUserProfileInput } from "@/domain/auth/auth-types";
import type { UserProfileRepository } from "./user-profile-repository";

const DEMO_PROFILES_KEY = "demo:profiles";

/**
 * Initialize demo profiles
 */
function initializeProfiles() {
  if (!localStorage.getItem(DEMO_PROFILES_KEY)) {
    localStorage.setItem(
      DEMO_PROFILES_KEY,
      JSON.stringify([
        {
          id: "demo-profile-001",
          authUserId: "demo-user-001",
          displayName: "Agus Setiawan",
          email: "demo@bolaid.id",
          phone: "+62812345678",
          avatarUrl: undefined,
          status: "ACTIVE",
          createdAt: new Date(2024, 0, 1).toISOString(),
          updatedAt: new Date(2024, 0, 1).toISOString(),
        },
      ])
    );
  }
}

export class DemoUserProfileRepository implements UserProfileRepository {
  constructor() {
    initializeProfiles();
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const profiles = this.getProfiles();
    return profiles.find((p) => p.id === userId) ?? null;
  }

  async updateProfile(userId: string, input: UpdateUserProfileInput): Promise<UserProfile> {
    const profiles = this.getProfiles();
    const index = profiles.findIndex((p) => p.id === userId);

    if (index === -1) {
      throw new Error("Profile not found");
    }

    const existing = profiles[index];
    if (!existing) {
      throw new Error("Profile not found");
    }

    const updated: any = {
      id: existing.id,
      authUserId: existing.authUserId,
      email: existing.email,
      status: existing.status,
      createdAt: existing.createdAt,
      displayName: input.displayName ?? existing.displayName,
      updatedAt: new Date().toISOString(),
    };

    // Add optional fields if present
    if (input.phone !== undefined || existing.phone !== undefined) {
      updated.phone = input.phone ?? existing.phone;
    }
    if (input.avatarUrl !== undefined || existing.avatarUrl !== undefined) {
      updated.avatarUrl = input.avatarUrl ?? existing.avatarUrl;
    }

    profiles[index] = updated as UserProfile;
    localStorage.setItem(DEMO_PROFILES_KEY, JSON.stringify(profiles));

    return updated as UserProfile;
  }

  private getProfiles(): UserProfile[] {
    const stored = localStorage.getItem(DEMO_PROFILES_KEY);
    return stored ? JSON.parse(stored) : [];
  }
}

export function createDemoUserProfileRepository(): UserProfileRepository {
  return new DemoUserProfileRepository();
}
