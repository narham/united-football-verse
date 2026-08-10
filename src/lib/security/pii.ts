/**
 * PII Security Utilities
 * PHASE 6 STEP 5 REMEDIATION — P1-3
 *
 * Sensitive identity documents: NIK, Passport, KITAS
 *
 * Responsibilities:
 *   1. Mask values for UI presentation
 *   2. Never write PII to logs / console / analytics
 *   3. Detect minors (safeguarding flag)
 *   4. Role-based access decisions for full-value disclosure
 *
 * Storage protection:
 *   NIK/Passport/KITAS are stored as plain TEXT in PostgreSQL
 *   because Supabase pgcrypto Transparent Column Encryption (TCE)
 *   requires pgsodium extension + explicit key management.
 *
 *   Protections in place:
 *     - RLS prevents unauthorized cross-tenant reads
 *     - DB-level UNIQUE prevents duplicates
 *     - Application layer masks values on output
 *     - Console/output redactors block accidental logging
 *
 *   If future architecture mandates at-rest encryption, migrate
 *   columns to BYTEA and use pgsodium seals.
 */

import type { OrganizationRole } from "@/domain/auth/auth-types";

export type DocumentKind = "NIK" | "PASSPORT" | "KITAS";

/**
 * Mask an identity document number.
 *   NIK (16 digits): show last 4 → ••••••••••••1234
 *   Passport/KITAS: show last 3 → •••••••AB1
 */
export function maskDocumentNumber(
    kind: DocumentKind,
    value: string | null | undefined,
): string {
    if (!value) return "-";
    const raw = value.trim();
    if (raw.length === 0) return "-";

    const visibleTail = kind === "NIK" ? 4 : 3;
    if (raw.length <= visibleTail) return "•".repeat(raw.length);

    return "•".repeat(raw.length - visibleTail) + raw.slice(-visibleTail);
}

/**
 * Mask NIK for public contexts
 */
export function maskNIK(nik: string | null | undefined): string {
    return maskDocumentNumber("NIK", nik);
}
export function maskPassport(passport: string | null | undefined): string {
    return maskDocumentNumber("PASSPORT", passport);
}
export function maskKitas(kitas: string | null | undefined): string {
    return maskDocumentNumber("KITAS", kitas);
}

/**
 * Deterministic, audit-safe logger redactor.
 * Removes keys that match PII patterns from objects before logging.
 * NEVER console.log an identity document. Use:
 *   console.log('player saved', redactPII(player));
 */
const PII_KEYS: ReadonlySet<string> = new Set([
    "nik",
    "nik_number",
    "nikNumber",
    "passport",
    "passport_number",
    "passportNumber",
    "kitas",
    "kitas_number",
    "kitasNumber",
    "document_number",
    "documentNumber",
    "full_nik",
    "fullPassport",
    "fullKitas",
]);

export function redactPII<T>(value: T): unknown {
    if (value === null || value === undefined) return value;
    if (typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map((v) => redactPII(v));

    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        if (PII_KEYS.has(key.toLowerCase())) {
            out[key] = "[REDACTED PII]";
        } else {
            out[key] = redactPII(val);
        }
    }
    return out;
}

/**
 * Safe console wrapper. Prevents accidental PII logging.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeInfo(...args: any[]): void {
    console.info(...args.map((a) => (typeof a === "object" ? redactPII(a) : a)));
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeWarn(...args: any[]): void {
    console.warn(...args.map((a) => (typeof a === "object" ? redactPII(a) : a)));
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeError(...args: any[]): void {
    console.error(...args.map((a) => (typeof a === "object" ? redactPII(a) : a)));
}

/**
 * Safeguarding: returns true if a player DOB indicates they are under 18.
 * Used to gate access to identity data in UI and repository projections.
 */
export function isMinor(dateOfBirthIso: string | null | undefined, asOf = new Date()): boolean {
    if (!dateOfBirthIso) return false;
    const dob = new Date(dateOfBirthIso);
    if (Number.isNaN(dob.getTime())) return false;
    let age = asOf.getFullYear() - dob.getFullYear();
    const m = asOf.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && asOf.getDate() < dob.getDate())) age--;
    return age < 18;
}

/**
 * Identity document access decision.
 * Returns:
 *   "FULL"  — authorized to see unmasked value
 *   "MASK"  — must show masked value only
 *   "HIDE"  — must show nothing, no value presence disclosure
 */
export type IdentityAccessDecision = "FULL" | "MASK" | "HIDE";

export function decideIdentityAccess(params: {
    role: OrganizationRole | null;
    subjectIsMinor: boolean;
}): IdentityAccessDecision {
    const { role, subjectIsMinor } = params;

    // Platform-level unrestricted
    if (role === "PLATFORM_ADMIN") return "FULL";

    // Full access for org owners, admins, and HR/identity managers
    if (role === "ORG_OWNER" || role === "ORG_ADMIN") return "FULL";

    // Manager/Finance can see masked (business reporting)
    if (role === "MANAGER" || role === "FINANCE") return "MASK";

    // Coach/Staff: for minors, HIDE identity docs entirely (safeguarding)
    if (role === "COACH" || role === "STAFF") {
        return subjectIsMinor ? "HIDE" : "MASK";
    }

    // Viewer / unknown roles
    if (role === "VIEWER") return subjectIsMinor ? "HIDE" : "MASK";

    // Unauthenticated / no role → hide
    return "HIDE";
}
