/**
 * Auth Context
 * 
 * Provides authentication state and operations to the application.
 * Automatically detects demo vs Supabase mode based on environment configuration.
 * 
 * Usage:
 * ```tsx
 * const { user, profile, isLoading, isAuthenticated } = useAuth();
 * ```
 */

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import type { AuthUser, UserProfile, AuthError, UpdateUserProfileInput } from "@/domain/auth/auth-types";
import type { AuthRepository } from "@/repositories/auth/auth-repository";
import { useRepositoriesContext } from "@/lib/repositories-context";

export interface AuthContextValue {
  // State
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authError: AuthError | null;

  // Operations
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, displayName: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (displayName?: string, phone?: string, avatarUrl?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;

  // Session
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 * 
 * Wraps the application and provides authentication context.
 * Must be placed inside RepositoriesProvider (requires repositories).
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const repositories = useRepositoriesContext();
  const authRepository = repositories.auth;

  // State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  // Initialize auth state on mount and subscribe to changes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const currentUser = await authRepository.getCurrentUser();
        setUser(currentUser);

        // Get current profile if user exists
        if (currentUser) {
          const currentProfile = await authRepository.getCurrentProfile();
          setProfile(currentProfile);
        }

        setAuthError(null);
      } catch (error) {
        const authErr: AuthError = {
          name: "AuthError",
          code: "AUTH_INVALID",
          message: error instanceof Error ? error.message : "Failed to initialize auth",
        };
        setAuthError(authErr);
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }

      // Subscribe to auth state changes
      unsubscribe = authRepository.onAuthStateChange(async (newUser) => {
        setUser(newUser);

        if (newUser) {
          try {
            const newProfile = await authRepository.getCurrentProfile();
            setProfile(newProfile);
          } catch (error) {
            console.error("Failed to fetch profile after auth state change:", error);
          }
        } else {
          setProfile(null);
        }
      });
    };

    initialize();

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [authRepository]);

  // Sign in
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        setAuthError(null);

        const result = await authRepository.signIn({ email, password });
        setUser(result.user);
        setProfile(result.profile);
      } catch (error) {
        const authErr: AuthError = {
          name: "AuthError",
          code: "AUTH_INVALID",
          message: error instanceof Error ? error.message : "Sign in failed",
        };
        setAuthError(authErr);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [authRepository]
  );

  // Sign up
  const signUp = useCallback(
    async (email: string, displayName: string, password: string) => {
      try {
        setIsLoading(true);
        setAuthError(null);

        const result = await authRepository.signUp({ email, displayName, password });
        setUser(result.user);
        setProfile(result.profile);
      } catch (error) {
        const authErr: AuthError = {
          name: "AuthError",
          code: "AUTH_INVALID",
          message: error instanceof Error ? error.message : "Sign up failed",
        };
        setAuthError(authErr);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [authRepository]
  );

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      setAuthError(null);

      await authRepository.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      const authErr: AuthError = {
        name: "AuthError",
        code: "AUTH_INVALID",
        message: error instanceof Error ? error.message : "Sign out failed",
      };
      setAuthError(authErr);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authRepository]);

  // Update profile
  const updateProfile = useCallback(
    async (displayName?: string, phone?: string, avatarUrl?: string) => {
      try {
        setIsLoading(true);
        setAuthError(null);

        // Build input object only with defined properties (exactOptionalPropertyTypes)
        const input: UpdateUserProfileInput = {};
        if (displayName !== undefined) {
          (input as any)["displayName"] = displayName;
        }
        if (phone !== undefined) {
          (input as any)["phone"] = phone;
        }
        if (avatarUrl !== undefined) {
          (input as any)["avatarUrl"] = avatarUrl;
        }

        const updatedProfile = await authRepository.updateProfile(input);
        setProfile(updatedProfile);
      } catch (error) {
        const authErr: AuthError = {
          name: "AuthError",
          code: "AUTH_INVALID",
          message: error instanceof Error ? error.message : "Failed to update profile",
        };
        setAuthError(authErr);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [authRepository]
  );

  // Reset password
  const resetPassword = useCallback(
    async (email: string) => {
      try {
        setIsLoading(true);
        setAuthError(null);

        await authRepository.resetPassword({ email });
      } catch (error) {
        const authErr: AuthError = {
          name: "AuthError",
          code: "AUTH_INVALID",
          message: error instanceof Error ? error.message : "Failed to reset password",
        };
        setAuthError(authErr);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [authRepository]
  );

  // Clear error
  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      const isValid = await authRepository.verifySession();
      if (!isValid) {
        setUser(null);
        setProfile(null);
      }
      return isValid;
    } catch (error) {
      console.error("Failed to refresh session:", error);
      return false;
    }
  }, [authRepository]);

  const value: AuthContextValue = {
    user,
    profile,
    isLoading,
    isAuthenticated: user !== null,
    authError,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    clearError,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * 
 * Access authentication context.
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
