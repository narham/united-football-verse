/**
 * User Profile Repository Interface
 * 
 * Manages user profile data independent of auth operations.
 * Implementations: Demo, Supabase
 */

import type {
  UserProfile,
  UpdateUserProfileInput,
} from "@/domain/auth/auth-types";

export interface UserProfileRepository {
  /**
   * Get profile by ID
   */
  getProfile(userId: string): Promise<UserProfile | null>;

  /**
   * Update user profile
   */
  updateProfile(userId: string, input: UpdateUserProfileInput): Promise<UserProfile>;
}
