/**
 * PHASE 6 STEP 5 — P1-3 UI masking boundary
 * The display model handed to components must never carry a full number.
 */
import { describe, it, expect } from "vitest";
import { createDisplayModel } from "@/domain/identity/identity-document-service";
import { containsPII } from "@/lib/security/pii";
import type { IdentityDocument } from "@/domain/identity/identity-document";

const doc = (overrides: Partial<IdentityDocument> = {}): IdentityDocument => ({
  id: "id-1",
  playerId: "p-1",
  clubId: "org-a",
  documentType: "NIK",
  documentNumber: "3273010101990001",
  issuingCountry: "ID",
  verificationStatus: "VERIFIED",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("identity UI display model", () => {
  it("masks NIK in the display model", () => {
    const d = doc();
    const view = createDisplayModel(d);
    expect(view.maskedNumber).not.toContain(d.documentNumber);
    expect(view.maskedNumber.endsWith("0001")).toBe(true);
    expect(containsPII(view.maskedNumber)).toBe(false);
  });

  it("masks passport in the display model", () => {
    const d = doc({ documentType: "PASSPORT", documentNumber: "A1234567" });
    const view = createDisplayModel(d);
    expect(view.maskedNumber).not.toContain("A1234567");
    expect(containsPII(view.maskedNumber)).toBe(false);
  });

  it("masks KITAS in the display model", () => {
    const d = doc({ documentType: "KITAS", documentNumber: "2C11JE1234" });
    const view = createDisplayModel(d);
    expect(view.maskedNumber).not.toContain("2C11JE1234");
    expect(containsPII(view.maskedNumber)).toBe(false);
  });
});
