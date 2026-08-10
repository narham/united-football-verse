/**
 * Supabase User Profile Repository
 * Fetches from user_profiles table
 */

import type { UserProfile, UpdateUserProfileInput } from "@/domain/auth/auth-types";
import type { UserProfileRepository } from "./user-profile-repository";
import type { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseUserProfileRepository implements UserProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapUserProfile(data);
  }

  async updateProfile(userId: string, input: UpdateUserProfileInput): Promise<UserProfile> {
    const updateData: any = {};
    if (input.displayName !== undefined) updateData.display_name = input.displayName;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl;

    const { data, error } = await this.supabase
      .from("user_profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error || !data) {
      throw new Error("Failed to update profile");
    }

    return this.mapUserProfile(data);
  }

  private mapUserProfile(data: any): UserProfile {
    return {
      id: data.id,
      authUserId: data.auth_user_id,
      displayName: data.display_name,
      email: data.email,
      phone: data.phone,
      avatarUrl: data.avatar_url,
      status: data.status as "ACTIVE" | "SUSPENDED" | "INACTIVE",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export function createSupabaseUserProfileRepository(
  supabase: SupabaseClient
): UserProfileRepository {
  return new SupabaseUserProfileRepository(supabase);
}
