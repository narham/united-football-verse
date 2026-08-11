/**
 * Demo Identity Document Repository
 * 
 * In-memory implementation using localStorage for persistence.
 * Enforces validation and duplicate detection.
 */

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
import { DemoStorage } from "./storage";
import { IDENTITY_ERROR, sanitizeText } from "@/lib/security/pii";
import { identityDocuments as initialIdentityDocuments } from "@/lib/demo-data";

/**
 * Demo implementation of IdentityDocumentRepository
 */
export class DemoIdentityDocumentRepository implements IdentityDocumentRepository {
  private storage: DemoStorage;

  constructor(storage?: DemoStorage) {
    // Use provided storage instance or create a new one
    // When called from factory, storage is provided and singleton
    if (storage) {
      this.storage = storage;
    } else {
      this.storage = new DemoStorage({ debug: false });
    }
    // Initialize identity documents storage with demo data if not already initialized
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    if (!this.storage.has("identity_documents")) {
      // Initialize with demo identity documents
      this.storage.set("identity_documents", initialIdentityDocuments);
    }
  }

  async getByPlayerId(playerId: string): Promise<IdentityDocument[]> {
    const allDocuments = this.storage.get<IdentityDocument[]>("identity_documents", undefined, []);
    return allDocuments.filter((doc) => doc.playerId === playerId);
  }

  async getById(id: string): Promise<IdentityDocument | null> {
    const allDocuments = this.storage.get<IdentityDocument[]>("identity_documents", undefined, []);
    return allDocuments.find((doc) => doc.id === id) || null;
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
      throw new Error(sanitizeText(validationResult.error ?? "") || IDENTITY_ERROR.INVALID);
    }

    // Check for duplicates
    const isDupe = await this.isDuplicate(
      input.documentType,
      input.documentNumber,
      input.issuingCountry
    );

    if (isDupe) {
      throw new Error(IDENTITY_ERROR.DUPLICATE);
    }

    // Normalize document number
    const normalizedNumber = normalizeDocumentNumber(input.documentType, input.documentNumber);

    const id = `identity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Determine initial verification status
    const initialStatus: IdentityDocument["verificationStatus"] =
      input.documentType === "NIK" ? "VERIFIED" : "PENDING"; // NIK auto-verified in demo

    const document: IdentityDocument = {
      id,
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

    const allDocuments = this.storage.get<IdentityDocument[]>("identity_documents", undefined, []);
    allDocuments.push(document);
    this.storage.set("identity_documents", allDocuments);

    return document;
  }

  async update(id: string, input: UpdateIdentityDocumentInput): Promise<IdentityDocument> {
    const document = await this.getById(id);

    if (!document) {
      throw new Error(IDENTITY_ERROR.NOT_FOUND);
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
        throw new Error(sanitizeText(validationResult.error ?? "") || IDENTITY_ERROR.INVALID);
      }

      // Check for duplicate with exclusion of current document
      const isDupe = await this.isDuplicate(
        document.documentType,
        input.documentNumber,
        input.issuingCountry || document.issuingCountry,
        id
      );

      if (isDupe) {
        throw new Error(IDENTITY_ERROR.DUPLICATE);
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

    const allDocuments = this.storage.get<IdentityDocument[]>("identity_documents", undefined, []);
    const index = allDocuments.findIndex((doc) => doc.id === id);

    if (index === -1) {
      throw new Error(IDENTITY_ERROR.NOT_FOUND);
    }

    allDocuments[index] = updated;
    this.storage.set("identity_documents", allDocuments);

    return updated;
  }

  async delete(id: string): Promise<void> {
    const document = await this.getById(id);

    if (!document) {
      throw new Error(IDENTITY_ERROR.NOT_FOUND);
    }

    const allDocuments = this.storage.get<IdentityDocument[]>("identity_documents", undefined, []);
    const filtered = allDocuments.filter((doc) => doc.id !== id);

    if (filtered.length === allDocuments.length) {
      throw new Error(IDENTITY_ERROR.NOT_FOUND);
    }

    this.storage.set("identity_documents", filtered);
  }

  async findByDocumentNumber(
    documentType: IdentityDocumentType,
    documentNumber: string,
    issuingCountry?: string
  ): Promise<IdentityDocument | null> {
    const normalized = normalizeDocumentNumber(documentType, documentNumber);
    const allDocuments = this.storage.get<IdentityDocument[]>("identity_documents", undefined, []);

    return (
      allDocuments.find((doc) => {
        if (doc.documentType !== documentType) return false;
        if (doc.documentNumber !== normalized) return false;

        // For passport/KITAS, also check issuing country
        if ((documentType === "PASSPORT" || documentType === "KITAS") && issuingCountry) {
          return doc.issuingCountry.toLowerCase() === issuingCountry.toLowerCase();
        }

        return true;
      }) || null
    );
  }

  async isDuplicate(
    documentType: IdentityDocumentType,
    documentNumber: string,
    issuingCountry?: string,
    excludeId?: string
  ): Promise<boolean> {
    const normalized = normalizeDocumentNumber(documentType, documentNumber);
    const allDocuments = this.storage.get<IdentityDocument[]>("identity_documents", undefined, []);

    return allDocuments.some((doc) => {
      if (excludeId && doc.id === excludeId) return false;
      if (doc.documentType !== documentType) return false;
      if (doc.documentNumber !== normalized) return false;

      // For passport/KITAS, also check issuing country
      if ((documentType === "PASSPORT" || documentType === "KITAS") && issuingCountry) {
        return doc.issuingCountry.toLowerCase() === issuingCountry.toLowerCase();
      }

      return true;
    });
  }
}
