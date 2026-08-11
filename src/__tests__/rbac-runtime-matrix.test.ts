/**
 * PHASE 6 STEP 5 — P1-4 RBAC Runtime Matrix Tests
 *
 * Verifies the runtime guard (src/lib/security/rbac.ts) against the
 * authoritative matrix (rbac-matrix.json) for all 8 roles.
 *
 * Principle under test: UI hiding is NOT authorization — a role denied in
 * the matrix must be denied when the operation is invoked directly.
 */
import { describe, it, expect } from "vitest";
import {
  can,
  assertCan,
  assertSameOrganization,
  AuthorizationError,
  TenancyError,
  RBAC_ROLES,
  type RbacEntity,
  type RbacAction,
} from "@/lib/security/rbac";
import type { OrganizationRole } from "@/domain/auth/auth-types";

const ENTITIES: RbacEntity[] = [
  "organization",
  "season",
  "team",
  "player",
  "staff",
  "training",
  "competition",
  "match",
  "transaction",
  "membership",
  "userProfile",
];
const ACTIONS: RbacAction[] = ["C", "R", "U", "D"];

describe("rbac matrix completeness", () => {
  it("defines all 8 roles", () => {
    expect(RBAC_ROLES.sort()).toEqual(
      [
        "COACH",
        "FINANCE",
        "MANAGER",
        "ORG_ADMIN",
        "ORG_OWNER",
        "PLATFORM_ADMIN",
        "STAFF",
        "VIEWER",
      ].sort(),
    );
  });

  it("defines every entity/action for every role", () => {
    for (const role of RBAC_ROLES) {
      for (const entity of ENTITIES) {
        for (const action of ACTIONS) {
          expect(typeof can(role, entity, action)).toBe("boolean");
        }
      }
    }
  });
});

describe("read boundary", () => {
  it("every role can read core entities", () => {
    for (const role of RBAC_ROLES) {
      expect(can(role, "player", "R")).toBe(true);
      expect(can(role, "training", "R")).toBe(true);
      expect(can(role, "organization", "R")).toBe(true);
    }
  });
});

describe("write boundaries per governance", () => {
  it("VIEWER is read-only on every entity", () => {
    for (const entity of ENTITIES) {
      expect(can("VIEWER", entity, "C")).toBe(false);
      expect(can("VIEWER", entity, "U")).toBe(false);
      expect(can("VIEWER", entity, "D")).toBe(false);
    }
  });

  it("FINANCE writes transactions only (separation of duties)", () => {
    expect(can("FINANCE", "transaction", "C")).toBe(true);
    expect(can("FINANCE", "transaction", "U")).toBe(true);
    expect(can("FINANCE", "staff", "C")).toBe(false);
    expect(can("FINANCE", "staff", "U")).toBe(false);
    expect(can("FINANCE", "staff", "D")).toBe(false);
    expect(can("FINANCE", "player", "C")).toBe(false);
  });

  it("COACH has no finance or staff write access", () => {
    expect(can("COACH", "transaction", "C")).toBe(false);
    expect(can("COACH", "transaction", "U")).toBe(false);
    expect(can("COACH", "staff", "C")).toBe(false);
    expect(can("COACH", "player", "C")).toBe(true);
    expect(can("COACH", "player", "D")).toBe(false);
  });

  it("STAFF cannot manage staff, competitions or matches", () => {
    expect(can("STAFF", "staff", "C")).toBe(false);
    expect(can("STAFF", "competition", "C")).toBe(false);
    expect(can("STAFF", "match", "C")).toBe(false);
    expect(can("STAFF", "training", "C")).toBe(true);
  });

  it("MANAGER cannot delete players or manage membership", () => {
    expect(can("MANAGER", "player", "D")).toBe(false);
    expect(can("MANAGER", "membership", "C")).toBe(false);
    expect(can("MANAGER", "membership", "U")).toBe(false);
    expect(can("MANAGER", "player", "C")).toBe(true);
  });

  it("only OWNER/ADMIN/PLATFORM manage membership", () => {
    const allowed: OrganizationRole[] = ["ORG_OWNER", "ORG_ADMIN", "PLATFORM_ADMIN"];
    for (const role of RBAC_ROLES) {
      expect(can(role, "membership", "C")).toBe(allowed.includes(role));
    }
  });

  it("only PLATFORM_ADMIN creates organizations", () => {
    for (const role of RBAC_ROLES) {
      expect(can(role, "organization", "C")).toBe(role === "PLATFORM_ADMIN");
    }
  });

  it("only ORG_OWNER and PLATFORM_ADMIN delete an organization", () => {
    for (const role of RBAC_ROLES) {
      expect(can(role, "organization", "D")).toBe(
        role === "ORG_OWNER" || role === "PLATFORM_ADMIN",
      );
    }
  });

  it("player delete restricted to owner/admin/platform", () => {
    const allowed: OrganizationRole[] = ["ORG_OWNER", "ORG_ADMIN", "PLATFORM_ADMIN"];
    for (const role of RBAC_ROLES) {
      expect(can(role, "player", "D")).toBe(allowed.includes(role));
    }
  });
});

describe("direct invocation guard", () => {
  it("denies unauthenticated / roleless callers", () => {
    expect(can(null, "player", "R")).toBe(false);
    expect(can(undefined, "player", "C")).toBe(false);
    expect(() => assertCan(null, "player", "C")).toThrow(AuthorizationError);
  });

  it("throws for a denied role even if the UI hid the control", () => {
    expect(() => assertCan("VIEWER", "player", "C")).toThrow(AuthorizationError);
    expect(() => assertCan("COACH", "transaction", "C")).toThrow(AuthorizationError);
    expect(() => assertCan("FINANCE", "staff", "U")).toThrow(AuthorizationError);
  });

  it("allows a permitted role", () => {
    expect(() => assertCan("ORG_OWNER", "player", "D")).not.toThrow();
    expect(() => assertCan("FINANCE", "transaction", "C")).not.toThrow();
  });

  it("rejects unknown roles and entities", () => {
    expect(can("SUPERUSER" as OrganizationRole, "player", "R")).toBe(false);
    expect(can("ORG_OWNER", "unknown" as RbacEntity, "R")).toBe(false);
  });
});

describe("tenancy guard", () => {
  it("allows same organization", () => {
    expect(() => assertSameOrganization("org-a", "org-a")).not.toThrow();
  });

  it("denies cross-organization access for every role", () => {
    expect(() => assertSameOrganization("org-a", "org-b")).toThrow(TenancyError);
    expect(() => assertSameOrganization(null, "org-b")).toThrow(TenancyError);
    expect(() => assertSameOrganization("org-a", null)).toThrow(TenancyError);
  });
});
