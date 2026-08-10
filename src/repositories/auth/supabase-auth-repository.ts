/**
 * Supabase Authentication Repository
 * 
 * Implements authentication using Supabase Auth + user_profiles table
 * Used when Supabase is configured.
 * 
 * Handles:
 * - Email/password authentication via Supabase Auth
 * - User profile creation and updates
 * - Session persistence via Supabase
 */

import type {
  AuthUser,
  UserProfile,
  SignInInput,
  SignUpInput,
  UpdateUserProfileInput,
  ResetPasswordInput,
  AuthError,
} from "@/domain/auth/auth-types";
import type { AuthRepository } from "./auth-repository";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Auth Repository
 */
export class SupabaseAuthRepository implements AuthRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get currently authenticated user from Supabase Auth
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data } = await this.supabase.auth.getUser();

    if (!data.user) {
      return null;
    }

    return this.mapAuthUser(data.user);
  }

  /**
   * Get current user's profile from user_profiles table
   */
  async getCurrentProfile(): Promise<UserProfile | null> {
    const { data: authData } = await this.supabase.auth.getUser();

    if (!authData.user) {
      return null;
    }

    const { data, error } = await this.supabase
      .from("user_profiles")
      .select("*")
      .eq("auth_user_id", authData.user.id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapUserProfile(data);
  }

  /**
   * Sign in with email and password
   * Returns user and profile
   */
  async signIn(input: SignInInput): Promise<{ user: AuthUser; profile: UserProfile }> {
    // Authenticate with Supabase Auth
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error || !data.user) {
      const authError = new Error(error?.message || "Sign in failed") as AuthError;
      authError.code = "AUTH_INVALID";
      throw authError;
    }

    // Fetch user profile
    const { data: profileData, error: profileError } = await this.supabase
      .from("user_profiles")
      .select("*")
      .eq("auth_user_id", data.user.id)
      .single();

    if (profileError || !profileData) {
      const authError = new Error("User profile not found") as AuthError;
      authError.code = "AUTH_INVALID";
      throw authError;
    }

    return {
      user: this.mapAuthUser(data.user),
      profile: this.mapUserProfile(profileData),
    };
  }

  /**
   * Sign up new user
   * Creates auth user and profile in user_profiles table
   */
  async signUp(input: SignUpInput): Promise<{ user: AuthUser; profile: UserProfile }> {
    // Create auth user
    const { data, error } = await this.supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });

    if (error || !data.user) {
      const authError = new Error(error?.message || "Sign up failed") as AuthError;
      authError.code = "AUTH_INVALID";
      throw authError;
    }

    // Create user profile
    const { data: profileData, error: profileError } = await this.supabase
      .from("user_profiles")
      .insert({
        auth_user_id: data.user.id,
        display_name: input.displayName,
        email: input.email,
        status: "ACTIVE",
      })
      .select()
      .single();

    if (profileError || !profileData) {
      const authError = new Error("Failed to create user profile") as AuthError;
      authError.code = "AUTH_INVALID";
      throw authError;
    }

    return {
      user: this.mapAuthUser(data.user),
      profile: this.mapUserProfile(profileData),
    };
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      const authError = new Error(error.message) as AuthError;
      authError.code = "AUTH_INVALID";
      throw authError;
    }
  }

  /**
   * Request password reset
   * Sends email via Supabase
   */
  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(input.email);

    if (error) {
      const authError = new Error(error.message) as AuthError;
      authError.code = "NETWORK_ERROR";
      throw authError;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(input: UpdateUserProfileInput): Promise<UserProfile> {
    const user = await this.getCurrentUser();

    if (!user) {
      const error = new Error("Not authenticated") as AuthError;
      error.code = "AUTH_REQUIRED";
      throw error;
    }

    // Update in user_profiles table
    const updateData: any = {};
    if (input.displayName !== undefined) updateData.display_name = input.displayName;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl;

    const { data, error } = await this.supabase
      .from("user_profiles")
      .update(updateData)
      .eq("auth_user_id", user.id)
      .select()
      .single();

    if (error || !data) {
      const authError = new Error("Failed to update profile") as AuthError;
      authError.code = "AUTH_INVALID";
      throw authError;
    }

    return this.mapUserProfile(data);
  }

  /**
   * Listen to auth state changes
   * Supabase automatically handles session state
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    const {
      data: { subscription },
    } = this.supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        callback(this.mapAuthUser(session.user));
      } else {
        callback(null);
      }
    });

    // Return unsubscribe function
    return () => subscription?.unsubscribe();
  }

  /**
   * Verify session is still valid
   */
  async verifySession(): Promise<boolean> {
    const { data } = await this.supabase.auth.getSession();
    return !!data.session;
  }

  /**
   * Helper: Map Supabase auth user to AuthUser
   */
  private mapAuthUser(supabaseUser: any): AuthUser {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      emailVerified: supabaseUser.email_confirmed_at !== null,
      createdAt: supabaseUser.created_at,
    };
  }

  /**
   * Helper: Map database user_profiles row to UserProfile
   */
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

/**
 * Create Supabase auth repository instance
 */
export function createSupabaseAuthRepository(
  supabase: SupabaseClient
): AuthRepository {
  return new SupabaseAuthRepository(supabase);
}
