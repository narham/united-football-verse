/**
 * Authentication Domain Types
 * 
 * Defines the core auth concepts:
 * - AuthUser (account identity)
 * - UserProfile (personal information)
 * - OrganizationRole (org-scoped role)
 * - OrganizationMembership (user → organization relationship)
 * 
 * Independent of storage backend (demo vs Supabase)
 */

// ============================================================
// Authentication User (from Supabase Auth or demo)
// ============================================================

export interface AuthUser {
  id: string;                    // Unique user ID (Supabase auth.users.id)
  email: string;                 // User's email (unique)
  emailVerified: boolean;        // Whether email is verified
  createdAt: string;             // RFC 3339 timestamp
}

// ============================================================
// User Profile (personal information)
// ============================================================

export interface UserProfile {
  id: string;                    // UUID (user_profiles.id)
  authUserId: string;            // Foreign key to auth.users
  displayName: string;           // Display name in UI
  email?: string;                // Email (optional, may duplicate auth)
  phone?: string;                // Contact phone
  avatarUrl?: string;            // Avatar image URL
  status: UserProfileStatus;     // Current profile status
  createdAt: string;             // RFC 3339 timestamp
  updatedAt: string;             // RFC 3339 timestamp
}

export type UserProfileStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE";

// ============================================================
// Organization Role (authorization)
// ============================================================

export type OrganizationRole =
  | "PLATFORM_ADMIN"   // Full platform access
  | "ORG_OWNER"        // Organization owner
  | "ORG_ADMIN"        // Organization administrator
  | "MANAGER"          // Operations manager
  | "COACH"            // Team coach
  | "STAFF"            // General staff
  | "FINANCE"          // Finance operations
  | "VIEWER";          // Read-only viewer

// ============================================================
// Organization Membership (user in organization)
// ============================================================

export interface OrganizationMembership {
  id: string;                    // UUID (organization_memberships.id)
  userId: string;                // Foreign key to user_profiles
  organizationId: string;        // Foreign key to clubs
  role: OrganizationRole;        // User's role in this organization
  status: MembershipStatus;      // Current membership status
  joinedAt?: string;             // When user joined organization
  createdAt: string;             // RFC 3339 timestamp
  updatedAt: string;             // RFC 3339 timestamp
}

export type MembershipStatus = "ACTIVE" | "INVITED" | "SUSPENDED" | "REVOKED";

// ============================================================
// Authentication Session
// ============================================================

export interface AuthSession {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  memberships: OrganizationMembership[];
  currentMembership: OrganizationMembership | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | null;
}

// ============================================================
// Input Types for Operations
// ============================================================

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
}

export interface UpdateUserProfileInput {
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ResetPasswordInput {
  email: string;
}

// ============================================================
// Authorization Context
// ============================================================

/**
 * Current user authorization state
 * Derived from membership + role
 */
export interface AuthorizationContext {
  userId: string | null;
  userProfile: UserProfile | null;
  currentOrganizationId: string | null;
  currentRole: OrganizationRole | null;
  isAuthenticated: boolean;
  permissions: Set<string>;
}

// ============================================================
// List Result (for memberships list)
// ============================================================

export interface ListResult<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
}

// ============================================================
// Error Types
// ============================================================

export type AuthErrorCode =
  | "AUTH_REQUIRED"
  | "AUTH_INVALID"
  | "AUTH_EXPIRED"
  | "MEMBERSHIP_REQUIRED"
  | "MEMBERSHIP_SUSPENDED"
  | "ACCESS_DENIED"
  | "ORGANIZATION_NOT_FOUND"
  | "PERMISSION_DENIED"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

export interface AuthError extends Error {
  code: AuthErrorCode;
  details?: Record<string, unknown>;
}
