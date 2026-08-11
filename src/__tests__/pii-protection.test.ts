/**
 * PHASE 6 STEP 5 — P1-3 PII Protection Runtime Tests
 */
import { describe, it, expect, vi } from "vitest";
import {
  maskNIK,
  maskPassport,
  maskKitas,
  maskDocumentNumber,
  redactPII,
  sanitizeText,
  sanitizeError,
  sanitizeEventPayload,
  containsPII,
  assertNoPIIInUrl,
  safeInfo,
  isMinor,
  decideIdentityAccess,
  IDENTITY_ERROR,
} from "@/lib/security/pii";

const NIK = "3273010101990001";
const PASSPORT = "A1234567";
const KITAS = "2C11JE1234";

describe("identity masking", () => {
  it("masks NIK showing only last 4", () => {
    const masked = maskNIK(NIK);
    expect(masked.endsWith("0001")).toBe(true);
    expect(masked).not.toContain("3273");
    expect(masked.length).toBe(NIK.length);
  });

  it("masks passport showing only last 3", () => {
    const masked = maskPassport(PASSPORT);
    expect(masked.endsWith("567")).toBe(true);
    expect(masked).not.toContain("A123");
  });

  it("masks KITAS showing only last 3", () => {
    const masked = maskKitas(KITAS);
    expect(masked.endsWith("234")).toBe(true);
    expect(masked).not.toContain("2C11");
  });

  it("handles empty/short values without leaking", () => {
    expect(maskNIK(null)).toBe("-");
    expect(maskNIK("")).toBe("-");
    expect(maskDocumentNumber("NIK", "12")).toBe("••");
  });
});

describe("log sanitization", () => {
  it("redacts PII keys from objects", () => {
    const out = redactPII({ name: "Agus", nik: NIK, nested: { passportNumber: PASSPORT } }) as any;
    expect(out.nik).toBe("[REDACTED PII]");
    expect(out.nested.passportNumber).toBe("[REDACTED PII]");
    expect(out.name).toBe("Agus");
  });

  it("safeInfo never writes a full identity number to console", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    safeInfo("player saved", { nik: NIK });
    const serialized = JSON.stringify(spy.mock.calls);
    expect(serialized).not.toContain(NIK);
    spy.mockRestore();
  });
});

describe("error sanitization", () => {
  it("scrubs identity numbers from DB error text", () => {
    const msg = sanitizeText(`duplicate key value violates unique constraint: ${NIK}`);
    expect(msg).not.toContain(NIK);
    expect(msg).toContain("[REDACTED]");
  });

  it("scrubs passport-shaped values", () => {
    expect(sanitizeText(`Duplicate passport ${PASSPORT}`)).not.toContain(PASSPORT);
  });

  it("sanitizeError returns a PII-free Error", () => {
    const err = sanitizeError(new Error(`Duplicate NIK ${NIK}`));
    expect(err.message).not.toContain(NIK);
  });

  it("falls back to a generic message", () => {
    expect(sanitizeError(new Error("")).message).toBe(IDENTITY_ERROR.FAILED);
  });

  it("canonical identity errors carry no numbers", () => {
    for (const m of Object.values(IDENTITY_ERROR)) {
      expect(containsPII(m)).toBe(false);
    }
  });
});

describe("event sanitization", () => {
  it("removes PII from domain event payloads", () => {
    const payload = sanitizeEventPayload({
      type: "IDENTITY_DOCUMENT_CREATED",
      documentNumber: NIK,
      note: `registered ${NIK}`,
    });
    const s = JSON.stringify(payload);
    expect(s).not.toContain(NIK);
  });
});

describe("URL leakage prevention", () => {
  it("detects identity numbers in URLs", () => {
    expect(containsPII(`/pemain?nik=${NIK}`)).toBe(true);
    expect(() => assertNoPIIInUrl(`/pemain?nik=${NIK}`)).toThrow();
  });

  it("allows normal id-based URLs", () => {
    expect(() => assertNoPIIInUrl("/pemain/player-1")).not.toThrow();
  });
});

describe("safeguarding access decisions", () => {
  it("detects minors", () => {
    expect(isMinor("2015-01-01")).toBe(true);
    expect(isMinor("1990-01-01")).toBe(false);
  });

  it("hides identity docs of minors from coach/staff/viewer", () => {
    for (const role of ["COACH", "STAFF", "VIEWER"] as const) {
      expect(decideIdentityAccess({ role, subjectIsMinor: true })).toBe("HIDE");
      expect(decideIdentityAccess({ role, subjectIsMinor: false })).toBe("MASK");
    }
  });

  it("grants full access only to owner/admin/platform", () => {
    expect(decideIdentityAccess({ role: "ORG_OWNER", subjectIsMinor: true })).toBe("FULL");
    expect(decideIdentityAccess({ role: "PLATFORM_ADMIN", subjectIsMinor: true })).toBe("FULL");
    expect(decideIdentityAccess({ role: "MANAGER", subjectIsMinor: true })).toBe("MASK");
    expect(decideIdentityAccess({ role: null, subjectIsMinor: false })).toBe("HIDE");
  });
});
