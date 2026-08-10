/**
 * Identity Document Validation Service
 * 
 * Centralized validation rules for all identity document types.
 * Does NOT infer or expose sensitive demographic information.
 * Only verifies structural correctness.
 */

import type { IdentityDocumentType, IdentityVerificationStatus } from "./identity-document";

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * NIK validation rules
 * 
 * - Exactly 16 digits
 * - Numeric only
 * - Structural validation only (no demographic inference)
 */
export function validateNIK(value: string): ValidationResult {
  if (!value) {
    return {
      isValid: false,
      error: "NIK harus diisi",
    };
  }

  const normalized = normalizeNumeric(value);

  if (!/^\d{16}$/.test(normalized)) {
    return {
      isValid: false,
      error: "NIK harus terdiri dari 16 digit",
    };
  }

  // Check for obviously invalid patterns (all same digits)
  if (/^(\d)\1{15}$/.test(normalized)) {
    return {
      isValid: false,
      error: "NIK tidak valid",
    };
  }

  return { isValid: true };
}

/**
 * Passport validation rules
 * 
 * - Alphanumeric
 * - Normalized to uppercase
 * - No leading/trailing spaces
 */
export function validatePassport(value: string): ValidationResult {
  if (!value) {
    return {
      isValid: false,
      error: "Nomor paspor harus diisi",
    };
  }

  const normalized = normalizeAlphanumeric(value);

  if (normalized.length < 5 || normalized.length > 20) {
    return {
      isValid: false,
      error: "Nomor paspor harus terdiri dari 5-20 karakter",
    };
  }

  if (!/^[A-Z0-9]+$/.test(normalized)) {
    return {
      isValid: false,
      error: "Nomor paspor hanya boleh berisi huruf dan angka",
    };
  }

  return { isValid: true };
}

/**
 * KITAS validation rules
 * 
 * - Alphanumeric
 * - Normalized to uppercase
 * - issuingCountry required
 * - expiresAt required
 */
export function validateKITAS(
  value: string,
  issuingCountry?: string,
  expiresAt?: string
): ValidationResult {
  if (!value) {
    return {
      isValid: false,
      error: "Nomor KITAS harus diisi",
    };
  }

  const normalized = normalizeAlphanumeric(value);

  if (normalized.length < 5 || normalized.length > 20) {
    return {
      isValid: false,
      error: "Nomor KITAS harus terdiri dari 5-20 karakter",
    };
  }

  if (!/^[A-Z0-9]+$/.test(normalized)) {
    return {
      isValid: false,
      error: "Nomor KITAS hanya boleh berisi huruf dan angka",
    };
  }

  if (!issuingCountry || issuingCountry.trim().length === 0) {
    return {
      isValid: false,
      error: "Negara penerbit wajib dipilih untuk KITAS",
    };
  }

  if (!expiresAt || expiresAt.trim().length === 0) {
    return {
      isValid: false,
      error: "Tanggal kedaluwarsa wajib diisi untuk KITAS",
    };
  }

  // Validate expiration date format
  const expirationResult = validateExpirationDate(expiresAt);
  if (!expirationResult.isValid) {
    return expirationResult;
  }

  return { isValid: true };
}

/**
 * Validate issuing country
 */
export function validateIssuingCountry(value: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return {
      isValid: false,
      error: "Negara penerbit harus diisi",
    };
  }

  return { isValid: true };
}

/**
 * Validate expiration date
 * 
 * - Must be valid ISO date format
 * - Can be in the past (status will be EXPIRED)
 */
export function validateExpirationDate(value: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return {
      isValid: false,
      error: "Tanggal kedaluwarsa harus diisi",
    };
  }

  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: "Format tanggal tidak valid",
      };
    }
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: "Format tanggal tidak valid",
    };
  }
}

/**
 * Check if document has expired
 */
export function isExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false;

  try {
    const expirationDate = new Date(expiresAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return expirationDate < today;
  } catch {
    return false;
  }
}

/**
 * Determine verification status based on expiration
 */
export function determineVerificationStatus(
  status: IdentityVerificationStatus,
  expiresAt?: string
): IdentityVerificationStatus {
  if (expiresAt && isExpired(expiresAt)) {
    return "EXPIRED";
  }
  return status;
}

/**
 * Normalize document number for a specific type
 */
export function normalizeDocumentNumber(
  documentType: IdentityDocumentType,
  value: string
): string {
  switch (documentType) {
    case "NIK":
      return normalizeNumeric(value);
    case "PASSPORT":
    case "KITAS":
      return normalizeAlphanumeric(value);
    default:
      return value;
  }
}

/**
 * Normalize numeric input (remove spaces)
 */
function normalizeNumeric(value: string): string {
  return value.replace(/\s/g, "");
}

/**
 * Normalize alphanumeric input (trim, uppercase, remove extra spaces)
 */
function normalizeAlphanumeric(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * Get user-friendly label for document type
 */
export function getDocumentTypeLabel(documentType: IdentityDocumentType): string {
  switch (documentType) {
    case "NIK":
      return "NIK";
    case "PASSPORT":
      return "Paspor";
    case "KITAS":
      return "KITAS";
    default:
      return documentType;
  }
}

/**
 * Get user-friendly label for verification status
 */
export function getVerificationStatusLabel(status: IdentityVerificationStatus): string {
  switch (status) {
    case "UNVERIFIED":
      return "Belum diverifikasi";
    case "PENDING":
      return "Menunggu verifikasi";
    case "VERIFIED":
      return "Terverifikasi";
    case "REJECTED":
      return "Ditolak";
    case "EXPIRED":
      return "Kedaluwarsa";
    default:
      return status;
  }
}

/**
 * Validation schema for complete identity document creation
 */
export function validateIdentityDocument(
  documentType: IdentityDocumentType,
  documentNumber: string,
  issuingCountry?: string,
  expiresAt?: string
): ValidationResult {
  switch (documentType) {
    case "NIK":
      return validateNIK(documentNumber);

    case "PASSPORT": {
      const passportValidation = validatePassport(documentNumber);
      if (!passportValidation.isValid) return passportValidation;
      return validateIssuingCountry(issuingCountry || "");
    }

    case "KITAS":
      return validateKITAS(documentNumber, issuingCountry, expiresAt);

    default:
      return { isValid: false, error: "Jenis dokumen tidak dikenal" };
  }
}
