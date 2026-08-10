/**
 * Identity Domain Index
 * 
 * Re-exports all identity-related types and utilities
 */

// Types and interfaces
export type {
  CitizenshipType,
  IdentityDocumentType,
  IdentityVerificationStatus,
  IdentityDocument,
  CreateIdentityDocumentInput,
  UpdateIdentityDocumentInput,
  PlayerWithCitizenshipInput,
  IdentityDocumentDisplay,
  PlayerWithIdentity,
} from "./identity-document";

// Validation utilities
export {
  validateNIK,
  validatePassport,
  validateKITAS,
  validateIssuingCountry,
  validateExpirationDate,
  isExpired,
  determineVerificationStatus,
  normalizeDocumentNumber,
  getDocumentTypeLabel,
  getVerificationStatusLabel,
  validateIdentityDocument,
  type ValidationResult,
} from "./identity-document-validator";

// Service utilities
export {
  maskDocumentNumber,
  createDisplayModel,
  createDisplayModels,
  getStatusText,
  getDocumentTypeText,
  getStatusBadgeClass,
  getStatusIcon,
  canEditDocument,
  canDeleteDocument,
  formatDate,
  needsAttention,
  getWarningMessage,
  getAccessibilityLabel,
} from "./identity-document-service";
