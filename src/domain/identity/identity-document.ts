/**
 * Identity Document Domain
 * 
 * Handles official identity documents for Indonesian and foreign citizens.
 * This domain is separate from Player to respect the conceptual model:
 * 
 * Person
 *   └── FootballIdentity (Football ID)
 *       └── IdentityDocument (NIK, Passport, KITAS)
 * 
 * In the current implementation, we model this as:
 * Player → IdentityDocument (person is implicit in player)
 */

/**
 * Citizenship type for the person
 */
export type CitizenshipType = "INDONESIAN" | "FOREIGN";

/**
 * Supported identity document types
 */
export type IdentityDocumentType = "NIK" | "PASSPORT" | "KITAS";

/**
 * Verification status of the identity document
 * 
 * UNVERIFIED: Not yet submitted for verification
 * PENDING: Awaiting verification by admin
 * VERIFIED: Successfully verified
 * REJECTED: Failed verification (invalid or duplicate)
 * EXPIRED: Document has passed expiration date
 */
export type IdentityVerificationStatus =
  | "UNVERIFIED"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED";

/**
 * Identity document entity
 * 
 * Represents official government-issued identity documents for persons.
 * Document numbers are classified as PII and must never be exposed in full
 * on the frontend without explicit purpose and safeguarding.
 * 
 * Note: Uses optional properties without explicit undefined to work with
 * TypeScript's exactOptionalPropertyTypes setting.
 */
export interface IdentityDocument {
  id: string;
  playerId: string; // Reference to player (person)
  documentType: IdentityDocumentType;
  documentNumber: string; // Full unmasked number (never displayed)
  issuingCountry: string; // ISO country code or name
  issuedAt?: string; // ISO 8601 date (optional)
  expiresAt?: string; // ISO 8601 date (required for KITAS, optional for Passport)
  verificationStatus: IdentityVerificationStatus;
  verifiedAt?: string; // ISO 8601 timestamp (optional)
  rejectionReason?: string; // Why verification failed (optional)
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  clubId: string; // For multi-tenant support
}

/**
 * Input for creating a new identity document
 */
export interface CreateIdentityDocumentInput {
  playerId: string;
  documentType: IdentityDocumentType;
  documentNumber: string;
  issuingCountry: string;
  issuedAt?: string;
  expiresAt?: string;
}

/**
 * Input for updating an identity document
 */
export interface UpdateIdentityDocumentInput {
  documentNumber?: string;
  issuingCountry?: string;
  issuedAt?: string;
  expiresAt?: string;
  verificationStatus?: IdentityVerificationStatus;
  rejectionReason?: string;
}

/**
 * Extended player input including citizenship info
 */
export interface PlayerWithCitizenshipInput {
  name: string;
  football_id: string;
  posisi: "GK" | "DF" | "MF" | "ST";
  status: "Aktif" | "Cedera" | "Cuti";
  citizenship: CitizenshipType;
  jersey_number?: number;
  birth_date?: string;
  nationality?: string;
  stats?: Record<string, unknown>;
  // Identity document fields (optional - can be added later)
  identityDocument?: {
    documentType: IdentityDocumentType;
    documentNumber: string;
    issuingCountry?: string;
    issuedAt?: string;
    expiresAt?: string;
  };
}

/**
 * Display model for identity document (with masked number)
 */
export interface IdentityDocumentDisplay {
  id: string;
  documentType: IdentityDocumentType;
  maskedNumber: string; // e.g., ••••••••••••4821
  issuingCountry: string;
  issuedAt?: string;
  expiresAt?: string;
  verificationStatus: IdentityVerificationStatus;
  verifiedAt?: string;
  isExpired: boolean;
}

/**
 * Extended player view with identity
 */
export interface PlayerWithIdentity {
  id: string;
  name: string;
  football_id: string;
  posisi: string;
  status: string;
  jersey_number?: number;
  birth_date?: string;
  nationality?: string;
  citizenship: CitizenshipType;
  identityDocuments?: IdentityDocumentDisplay[];
  createdAt: string;
  updatedAt: string;
}
