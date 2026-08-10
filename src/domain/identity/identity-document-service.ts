/**
 * Identity Document Service
 * 
 * High-level operations and utilities for identity documents.
 * Handles masking, expiration checks, and display logic.
 */

import type {
  IdentityDocument,
  IdentityDocumentDisplay,
  IdentityDocumentType,
} from "./identity-document";
import {
  isExpired,
  determineVerificationStatus,
  getDocumentTypeLabel,
  getVerificationStatusLabel,
} from "./identity-document-validator";

/**
 * Mask a document number for safe display
 * 
 * Rules:
 * - Show only last 4 characters
 * - Mask everything else with bullets
 * - Minimum 8 bullets for security
 * 
 * Examples:
 * NIK:        1234567890123456 → ••••••••••••3456
 * Passport:   AB1234567 → •••••4567
 * KITAS:      2C123456789 → •••••••6789
 */
export function maskDocumentNumber(value: string, documentType: IdentityDocumentType): string {
  if (!value || value.length <= 4) {
    return "••••••••";
  }

  const lastFour = value.slice(-4);
  const maskedLength = Math.max(8, value.length - 4);
  const maskedPart = "•".repeat(maskedLength);

  return maskedPart + lastFour;
}

/**
 * Create a safe display model from internal document
 * 
 * This is the ONLY place where full document numbers are accessed.
 * Use this function to create display models for UI rendering.
 * Never pass full document numbers directly to components.
 */
export function createDisplayModel(document: IdentityDocument): IdentityDocumentDisplay {
  const actualStatus = determineVerificationStatus(document.verificationStatus, document.expiresAt);

  const display: IdentityDocumentDisplay = {
    id: document.id,
    documentType: document.documentType,
    maskedNumber: maskDocumentNumber(document.documentNumber, document.documentType),
    issuingCountry: document.issuingCountry,
    verificationStatus: actualStatus,
    isExpired: isExpired(document.expiresAt),
  };

  // Only add optional properties if they exist
  if (document.issuedAt !== undefined) {
    display.issuedAt = document.issuedAt;
  }

  if (document.expiresAt !== undefined) {
    display.expiresAt = document.expiresAt;
  }

  if (document.verifiedAt !== undefined) {
    display.verifiedAt = document.verifiedAt;
  }

  return display;
}

/**
 * Create display models from multiple documents
 */
export function createDisplayModels(documents: IdentityDocument[]): IdentityDocumentDisplay[] {
  return documents.map(createDisplayModel);
}

/**
 * Get verification status text for display
 */
export function getStatusText(status: IdentityDocumentDisplay["verificationStatus"]): string {
  return getVerificationStatusLabel(status);
}

/**
 * Get document type text for display
 */
export function getDocumentTypeText(documentType: IdentityDocumentType): string {
  return getDocumentTypeLabel(documentType);
}

/**
 * Get CSS class for verification status badge
 * 
 * Use for styling the verification badge
 */
export function getStatusBadgeClass(status: IdentityDocumentDisplay["verificationStatus"]): string {
  switch (status) {
    case "VERIFIED":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "REJECTED":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "EXPIRED":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "UNVERIFIED":
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

/**
 * Get icon for verification status
 * 
 * Returns a simple text indicator or icon name
 */
export function getStatusIcon(status: IdentityDocumentDisplay["verificationStatus"]): string {
  switch (status) {
    case "VERIFIED":
      return "✓"; // checkmark
    case "PENDING":
      return "⏳"; // hourglass
    case "REJECTED":
      return "✗"; // x mark
    case "EXPIRED":
      return "⏰"; // clock
    case "UNVERIFIED":
    default:
      return "?"; // question mark
  }
}

/**
 * Determine if document can be edited based on status
 */
export function canEditDocument(status: IdentityDocumentDisplay["verificationStatus"]): boolean {
  // Can only edit UNVERIFIED or REJECTED documents
  return status === "UNVERIFIED" || status === "REJECTED";
}

/**
 * Determine if document can be deleted
 */
export function canDeleteDocument(status: IdentityDocumentDisplay["verificationStatus"]): boolean {
  // Can delete any document (admin might revoke)
  return true;
}

/**
 * Format date for display (ISO to local)
 */
export function formatDate(isoDate?: string): string {
  if (!isoDate) return "";

  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return isoDate;
  }
}

/**
 * Check if identity document needs attention (expired or pending)
 */
export function needsAttention(document: IdentityDocumentDisplay): boolean {
  return document.verificationStatus === "EXPIRED" || document.verificationStatus === "PENDING";
}

/**
 * Get a warning message if document needs attention
 */
export function getWarningMessage(document: IdentityDocumentDisplay): string | null {
  if (document.verificationStatus === "EXPIRED") {
    return "Dokumen identitas telah kedaluwarsa. Silakan perbarui.";
  }

  if (document.verificationStatus === "PENDING") {
    return "Dokumen identitas menunggu verifikasi.";
  }

  if (document.verificationStatus === "REJECTED") {
    return "Verifikasi dokumen identitas ditolak.";
  }

  return null;
}

/**
 * Accessibility label for masked document
 * 
 * Used for screen readers to provide context without exposing number
 */
export function getAccessibilityLabel(
  documentType: IdentityDocumentType,
  maskedNumber: string,
  status: IdentityDocumentDisplay["verificationStatus"]
): string {
  const typeLabel = getDocumentTypeLabel(documentType);
  const statusLabel = getVerificationStatusLabel(status);

  return `${typeLabel} ${maskedNumber}, ${statusLabel}`;
}
