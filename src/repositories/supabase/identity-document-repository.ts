/**
 * Supabase Identity Document Repository
 * 
 * Real persistence implementation using Supabase PostgreSQL.
 * Enforces all validation and duplicate detection at repository level.
 * RLS policies provide additional database-level access control.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IdentityDocument,
  CreateIdentityDocumentInput,
  UpdateIdentityDocumentInput,
  IdentityDocumentType,
} from "../../domain/identity/identity-document";
import type { IdentityDocumentRepository } from "../interfaces/identity-document-repository";
import {
  normalizeDocumentNumber,
  validateIdentityDocument,
  isExpired,
  determineVerificationStatus,
} from "../../domain/identity/identity-document-validator";

/**
 * Supabase implementation of IdentityDocumentRepository
 */
export class SupabaseIdentityDocumentRepository implements IdentityDocumentRepository {
  constructor(private supabase: SupabaseClient) {}

  async getByPlayerId(playerId: string): Promise<IdentityDocument[]> {
    const { data, error } = await this.supabase
      .from("identity_documents")
      .select("*")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch identity documents: ${error.message}`);
    }

    return (data || []).map((doc) => this.mapFromDatabase(doc));
  }

  async getById(id: string): Promise<IdentityDocument | null> {
    const { data, error } = await this.supabase
      .from("identity_documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found - return null instead of error
        return null;
      }
      throw new Error(`Failed to fetch identity document: ${error.message}`);
    }

    return data ? this.mapFromDatabase(data) : null;
  }

  async create(clubId: string, input: CreateIdentityDocumentInput): Promise<IdentityDocument> {
    // Validate input
    const validationResult = validateIdentityDocument(
      input.documentType,
      input.documentNumber,
      input.issuingCountry,
      input.expiresAt
    );

    if (!validationResult.isValid) {
      throw new Error(validationResult.error || "Dokumen identitas tidak valid");
    }

    // Check for duplicates
    const isDupe = await this.isDuplicate(
      input.documentType,
      input.documentNumber,
      input.issuingCountry
    );

    if (isDupe) {
      throw new Error("Dokumen identitas ini sudah terdaftar");
    }

    // Normalize document number
    const normalizedNumber = normalizeDocumentNumber(input.documentType, input.documentNumber);

    const now = new Date().toISOString();

    // Determine initial verification status
    const initialStatus: IdentityDocument["verificationStatus"] =
      input.documentType === "NIK" ? "VERIFIED" : "PENDING"; // NIK auto-verified

    const document: IdentityDocument = {
      id: crypto.randomUUID(),
      playerId: input.playerId,
      documentType: input.documentType,
      documentNumber: normalizedNumber,
      issuingCountry: input.issuingCountry,
      verificationStatus: determineVerificationStatus(initialStatus, input.expiresAt),
      createdAt: now,
      updatedAt: now,
      clubId,
    };

    // Add optional properties if provided
    if (input.issuedAt !== undefined) {
      document.issuedAt = input.issuedAt;
    }
    if (input.expiresAt !== undefined) {
      document.expiresAt = input.expiresAt;
    }
    if (input.documentType === "NIK" && initialStatus === "VERIFIED") {
      document.verifiedAt = now;
    }

    // Insert into database
    const { error } = await this.supabase.from("identity_documents").insert([
      this.mapToDatabase(document),
    ]);

    if (error) {
      // Check if it's a duplicate constraint error
      if (error.code === "23505") {
        throw new Error("Dokumen identitas ini sudah terdaftar");
      }
      throw new Error(`Failed to create identity document: ${error.message}`);
    }

    return document;
  }

  async update(id: string, input: UpdateIdentityDocumentInput): Promise<IdentityDocument> {
    const document = await this.getById(id);

    if (!document) {
      throw new Error("Dokumen identitas tidak ditemukan");
    }

    // If document number is being changed, validate it
    if (input.documentNumber && input.documentNumber !== document.documentNumber) {
      const validationResult = validateIdentityDocument(
        document.documentType,
        input.documentNumber,
        input.issuingCountry || document.issuingCountry,
        input.expiresAt || document.expiresAt
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.error || "Dokumen identitas tidak valid");
      }

      // Check for duplicate with exclusion of current document
      const isDupe = await this.isDuplicate(
        document.documentType,
        input.documentNumber,
        input.issuingCountry || document.issuingCountry,
        id
      );

      if (isDupe) {
        throw new Error("Nomor dokumen identitas ini sudah terdaftar");
      }
    }

    // Normalize if changed
    const normalizedNumber = input.documentNumber
      ? normalizeDocumentNumber(document.documentType, input.documentNumber)
      : document.documentNumber;

    const updated: IdentityDocument = {
      ...document,
      documentNumber: normalizedNumber,
      issuingCountry: input.issuingCountry || document.issuingCountry,
      verificationStatus:
        input.verificationStatus !== undefined ? input.verificationStatus : document.verificationStatus,
      updatedAt: new Date().toISOString(),
    };

    // Only update optional properties if explicitly provided
    if (input.issuedAt !== undefined) {
      updated.issuedAt = input.issuedAt;
    }

    if (input.expiresAt !== undefined) {
      updated.expiresAt = input.expiresAt;
    }

    if (input.rejectionReason !== undefined) {
      updated.rejectionReason = input.rejectionReason;
    }

    // Re-determine status based on expiration
    updated.verificationStatus = determineVerificationStatus(
      updated.verificationStatus,
      updated.expiresAt
    );

    // Update in database
    const { error } = await this.supabase
      .from("identity_documents")
      .update(this.mapToDatabase(updated))
      .eq("id", id);

    if (error) {
      if (error.code === "23505") {
        throw new Error("Nomor dokumen identitas ini sudah terdaftar");
      }
      throw new Error(`Failed to update identity document: ${error.message}`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const document = await this.getById(id);

    if (!document) {
      throw new Error("Dokumen identitas tidak ditemukan");
    }

    const { error } = await this.supabase
      .from("identity_documents")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete identity document: ${error.message}`);
    }
  }

  async findByDocumentNumber(
    documentType: IdentityDocumentType,
    documentNumber: string,
    issuingCountry?: string
  ): Promise<IdentityDocument | null> {
    const normalized = normalizeDocumentNumber(documentType, documentNumber);

    let query = this.supabase
      .from("identity_documents")
      .select("*")
      .eq("document_type", documentType)
      .eq("document_number_normalized", normalized);

    // For passport/KITAS, also check issuing country
    if ((documentType === "PASSPORT" || documentType === "KITAS") && issuingCountry) {
      query = query.eq("issuing_country", issuingCountry);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Failed to find identity document: ${error.message}`);
    }

    return data ? this.mapFromDatabase(data) : null;
  }

  async isDuplicate(
    documentType: IdentityDocumentType,
    documentNumber: string,
    issuingCountry?: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const document = await this.findByDocumentNumber(documentType, documentNumber, issuingCountry);

      if (!document) {
        return false;
      }

      // If excludeId provided, check if found document should be excluded
      if (excludeId && document.id === excludeId) {
        return false;
      }

      return true;
    } catch {
      // On error, assume not duplicate to allow user to try again
      return false;
    }
  }

  /**
   * Map database record to domain model
   */
  private mapFromDatabase(data: any): IdentityDocument {
    const document: IdentityDocument = {
      id: data.id,
      playerId: data.player_id,
      documentType: data.document_type,
      documentNumber: data.document_number,
      issuingCountry: data.issuing_country,
      verificationStatus: data.verification_status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      clubId: data.club_id,
    };

    // Add optional properties if they exist
    if (data.issued_at !== null) {
      document.issuedAt = data.issued_at;
    }
    if (data.expires_at !== null) {
      document.expiresAt = data.expires_at;
    }
    if (data.verified_at !== null) {
      document.verifiedAt = data.verified_at;
    }
    if (data.rejection_reason !== null) {
      document.rejectionReason = data.rejection_reason;
    }

    return document;
  }

  /**
   * Map domain model to database record
   */
  private mapToDatabase(document: IdentityDocument): Record<string, any> {
    const normalized = normalizeDocumentNumber(document.documentType, document.documentNumber);

    return {
      id: document.id,
      player_id: document.playerId,
      club_id: document.clubId,
      document_type: document.documentType,
      document_number: document.documentNumber,
      document_number_normalized: normalized,
      issuing_country: document.issuingCountry,
      issued_at: document.issuedAt || null,
      expires_at: document.expiresAt || null,
      verification_status: document.verificationStatus,
      verified_at: document.verifiedAt || null,
      rejection_reason: document.rejectionReason || null,
      created_at: document.createdAt,
      updated_at: document.updatedAt,
    };
  }
}
