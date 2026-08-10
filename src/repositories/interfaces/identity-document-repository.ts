/**
 * Identity Document Repository Interface
 * 
 * Contracts for identity document storage and retrieval.
 * Implementations should enforce duplicate detection and validation.
 */

import type {
  IdentityDocument,
  CreateIdentityDocumentInput,
  UpdateIdentityDocumentInput,
  IdentityDocumentType,
} from "../../domain/identity/identity-document";

/**
 * Repository interface for identity document operations
 */
export interface IdentityDocumentRepository {
  /**
   * Get all identity documents for a specific player
   */
  getByPlayerId(playerId: string): Promise<IdentityDocument[]>;

  /**
   * Get a specific identity document by ID
   */
  getById(id: string): Promise<IdentityDocument | null>;

  /**
   * Create a new identity document
   * 
   * Validates:
   * - Document number is properly formatted
   * - No duplicate document number exists (same type/country)
   * - Expiration date is valid (if provided)
   * 
   * @throws Error if validation fails or duplicate detected
   */
  create(clubId: string, input: CreateIdentityDocumentInput): Promise<IdentityDocument>;

  /**
   * Update an existing identity document
   * 
   * Supports partial updates.
   * Re-validates document number if changed.
   * 
   * @throws Error if document not found or validation fails
   */
  update(id: string, input: UpdateIdentityDocumentInput): Promise<IdentityDocument>;

  /**
   * Delete an identity document
   * 
   * @throws Error if document not found
   */
  delete(id: string): Promise<void>;

  /**
   * Find document by number and type
   * 
   * Used for duplicate detection.
   * Returns null if not found (not an error).
   */
  findByDocumentNumber(
    documentType: IdentityDocumentType,
    documentNumber: string,
    issuingCountry?: string
  ): Promise<IdentityDocument | null>;

  /**
   * Check if document number is already registered
   * 
   * Excludes a specific document ID (for update scenarios)
   */
  isDuplicate(
    documentType: IdentityDocumentType,
    documentNumber: string,
    issuingCountry?: string,
    excludeId?: string
  ): Promise<boolean>;
}
