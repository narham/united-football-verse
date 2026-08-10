/**
 * Authentication Repository Interface
 * 
 * Defines the contract for authentication operations.
 * Implementations: DemoAuthRepository, SupabaseAuthRepository
 * 
 * This abstraction allows switching between demo (localStorage)
 * and Supabase Auth without changing application code.
 */

import type {
  AuthUser,
  UserProfile,
  OrganizationMembership,
  SignInInput,
  SignUpInput,
  UpdateUserProfileInput,
  ResetPasswordInput,
} from "@/domain/auth/auth-types";

// ============================================================
// Auth Repository Interface
// ============================================================

export interface AuthRepository {
  /**
   * Get the currently authenticated user
   * Returns null if not authenticated
   */
  getCurrentUser(): Promise<AuthUser | null>;

  /**
   * Get the current user's profile
   * Returns null if no profile or not authenticated
   */
  getCurrentProfile(): Promise<UserProfile | null>;

  /**
   * Sign in with email and password
   * Throws AuthError if invalid credentials
   */
  signIn(input: SignInInput): Promise<{ user: AuthUser; profile: UserProfile }>;

  /**
   * Sign up new user
   * Creates both auth user and profile
   */
  signUp(input: SignUpInput): Promise<{ user: AuthUser; profile: UserProfile }>;

  /**
   * Sign out the current user
   * Clears session
   */
  signOut(): Promise<void>;

  /**
   * Request password reset email
   * Demo mode may skip email sending
   */
  resetPassword(input: ResetPasswordInput): Promise<void>;

  /**
   * Update user profile information
   */
  updateProfile(input: UpdateUserProfileInput): Promise<UserProfile>;

  /**
   * Listen to authentication state changes
   * Called when user logs in/out or session changes
   * Returns unsubscribe function
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void;

  /**
   * Verify current session is still valid
   * Used for session persistence
   */
  verifySession(): Promise<boolean>;
}
