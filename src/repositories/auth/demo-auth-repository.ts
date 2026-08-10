/**
 * Demo Authentication Repository
 * 
 * Simulates authentication using browser localStorage.
 * Used when Supabase is not configured.
 * 
 * Demo credentials:
 * - email: demo@bolaID.id
 * - password: demo123
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

// Demo users storage
const DEMO_USERS_KEY = "demo:users";
const DEMO_SESSION_KEY = "demo:session";

// Demo user account
const DEMO_USER: AuthUser = {
  id: "demo-user-001",
  email: "demo@bolaid.id",
  emailVerified: true,
  createdAt: new Date(2024, 0, 1).toISOString(),
};

// Demo user profile
let DEMO_PROFILE: UserProfile = {
  id: "demo-profile-001",
  authUserId: DEMO_USER.id,
  displayName: "Agus Setiawan",
  email: DEMO_USER.email,
  status: "ACTIVE",
  createdAt: new Date(2024, 0, 1).toISOString(),
  updatedAt: new Date(2024, 0, 1).toISOString(),
} as any;
// Add phone and avatarUrl if present (follow exactOptionalPropertyTypes)
DEMO_PROFILE.phone = "+62812345678";

// Demo password (plaintext in demo only - never do this in production)
const DEMO_PASSWORD = "demo123";

// Auth state change listeners
const authListeners: Array<(user: AuthUser | null) => void> = [];

/**
 * Demo Auth Repository
 * Implements auth contract using localStorage
 */
export class DemoAuthRepository implements AuthRepository {
  constructor() {
    this.initializeDemo();
  }

  /**
   * Initialize demo data if not exists
   */
  private initializeDemo(): void {
    if (!localStorage.getItem(DEMO_USERS_KEY)) {
      localStorage.setItem(
        DEMO_USERS_KEY,
        JSON.stringify([
          {
            user: DEMO_USER,
            profile: DEMO_PROFILE,
            password: DEMO_PASSWORD,
          },
        ])
      );
    }
  }

  /**
   * Get current authenticated user from session
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const session = this.getSession();
    return session?.user ?? null;
  }

  /**
   * Get current user's profile from session
   */
  async getCurrentProfile(): Promise<UserProfile | null> {
    const session = this.getSession();
    return session?.profile ?? null;
  }

  /**
   * Sign in with email and password
   */
  async signIn(input: SignInInput): Promise<{ user: AuthUser; profile: UserProfile }> {
    const users = this.getUsers();
    const user = users.find((u) => u.user.email === input.email);

    if (!user || user.password !== input.password) {
      const error = new Error("Invalid email or password") as AuthError;
      error.code = "AUTH_INVALID";
      throw error;
    }

    // Store session
    localStorage.setItem(
      DEMO_SESSION_KEY,
      JSON.stringify({
        user: user.user,
        profile: user.profile,
      })
    );

    // Notify listeners
    authListeners.forEach((listener) => listener(user.user));

    return {
      user: user.user,
      profile: user.profile,
    };
  }

  /**
   * Sign up new user
   * Demo: accepts any valid email + password
   */
  async signUp(input: SignUpInput): Promise<{ user: AuthUser; profile: UserProfile }> {
    const users = this.getUsers();

    // Check if email already exists
    if (users.some((u) => u.user.email === input.email)) {
      const error = new Error("Email already in use") as AuthError;
      error.code = "AUTH_INVALID";
      throw error;
    }

    // Create new user
    const newAuthUser: AuthUser = {
      id: `demo-user-${Date.now()}`,
      email: input.email,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };

    const newProfile: UserProfile = {
      id: `demo-profile-${Date.now()}`,
      authUserId: newAuthUser.id,
      displayName: input.displayName,
      email: input.email,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store new user
    users.push({
      user: newAuthUser,
      profile: newProfile,
      password: input.password,
    });

    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));

    // Auto-sign in new user
    localStorage.setItem(
      DEMO_SESSION_KEY,
      JSON.stringify({
        user: newAuthUser,
        profile: newProfile,
      })
    );

    authListeners.forEach((listener) => listener(newAuthUser));

    return {
      user: newAuthUser,
      profile: newProfile,
    };
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    localStorage.removeItem(DEMO_SESSION_KEY);
    authListeners.forEach((listener) => listener(null));
  }

  /**
   * Reset password
   * Demo: just acknowledge (no email sent)
   */
  async resetPassword(_input: ResetPasswordInput): Promise<void> {
    // In demo mode, we just acknowledge the request
    // In real Supabase mode, this would send an email
    console.log("Demo: Password reset email would be sent (not implemented)");
  }

  /**
   * Update user profile
   */
  async updateProfile(input: UpdateUserProfileInput): Promise<UserProfile> {
    const session = this.getSession();

    if (!session) {
      const error = new Error("Not authenticated") as AuthError;
      error.code = "AUTH_REQUIRED";
      throw error;
    }

    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.user.id === session.user.id);

    if (userIndex === -1) {
      const error = new Error("User not found") as AuthError;
      error.code = "AUTH_INVALID";
      throw error;
    }

    // Update profile
    const updatedProfile: any = {
      ...session.profile,
      updatedAt: new Date().toISOString(),
    };
    if (input.displayName !== undefined) updatedProfile.displayName = input.displayName;
    if (input.phone !== undefined) updatedProfile.phone = input.phone;
    if (input.avatarUrl !== undefined) updatedProfile.avatarUrl = input.avatarUrl;

    const userToUpdate = users[userIndex];
    if (!userToUpdate) {
      const error = new Error("User not found") as AuthError;
      error.code = "AUTH_INVALID";
      throw error;
    }
    userToUpdate.profile = updatedProfile;
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));

    // Update session
    localStorage.setItem(
      DEMO_SESSION_KEY,
      JSON.stringify({
        user: session.user,
        profile: updatedProfile,
      })
    );

    return updatedProfile;
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    authListeners.push(callback);

    // Immediately call with current state
    const currentUser = this.getSession()?.user ?? null;
    callback(currentUser);

    // Return unsubscribe function
    return () => {
      const index = authListeners.indexOf(callback);
      if (index !== -1) {
        authListeners.splice(index, 1);
      }
    };
  }

  /**
   * Verify session is still valid
   */
  async verifySession(): Promise<boolean> {
    const session = this.getSession();
    if (!session) return false;

    // In demo, just verify the user exists
    const users = this.getUsers();
    return users.some((u) => u.user.id === session.user.id);
  }

  /**
   * Helper: Get current session from localStorage
   */
  private getSession() {
    const stored = localStorage.getItem(DEMO_SESSION_KEY);
    return stored
      ? (JSON.parse(stored) as {
          user: AuthUser;
          profile: UserProfile;
        })
      : null;
  }

  /**
   * Helper: Get all users from localStorage
   */
  private getUsers() {
    const stored = localStorage.getItem(DEMO_USERS_KEY);
    return stored
      ? (JSON.parse(stored) as Array<{
          user: AuthUser;
          profile: UserProfile;
          password: string;
        }>)
      : [
          {
            user: DEMO_USER,
            profile: DEMO_PROFILE,
            password: DEMO_PASSWORD,
          },
        ];
  }
}

/**
 * Create demo auth repository instance
 */
export function createDemoAuthRepository(): AuthRepository {
  return new DemoAuthRepository();
}
