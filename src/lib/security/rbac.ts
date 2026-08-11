/**
 * Runtime RBAC Guard
 * PHASE 6 STEP 5 REMEDIATION — P1-4
 *
 * Single source of truth = src/lib/security/rbac-matrix.json
 * (authoritative; mirrored by RLS policies in src/migrations/*).
 *
 * CRITICAL PRINCIPLE: UI hiding is NOT authorization.
 * Every protected operation must call `assertCan` (or `can`) — not only
 * hide a button — so that direct repository/hook invocation is denied too.
 */

import matrix from "./rbac-matrix.json";
import type { OrganizationRole } from "@/domain/auth/auth-types";

export type RbacEntity =
    | "organization"
    | "season"
    | "team"
    | "player"
    | "staff"
    | "training"
    | "competition"
    | "match"
    | "transaction"
    | "membership"
    | "userProfile";

export type RbacAction = "C" | "R" | "U" | "D";

type MatrixShape = {
    roles: Record<
        string,
        { description: string; entities: Record<string, Record<RbacAction, boolean>> }
    >;
};

const RBAC = matrix as unknown as MatrixShape;

export const RBAC_ROLES = Object.keys(RBAC.roles) as OrganizationRole[];

/** Pure permission check against the authoritative matrix. */
export function can(
    role: OrganizationRole | null | undefined,
    entity: RbacEntity,
    action: RbacAction,
): boolean {
    if (!role) return false;
    const roleDef = RBAC.roles[role];
    if (!roleDef) return false;
    const entityDef = roleDef.entities[entity];
    if (!entityDef) return false;
    return entityDef[action] === true;
}

export class AuthorizationError extends Error {
    readonly code = "PERMISSION_DENIED";
    constructor(entity: RbacEntity, action: RbacAction) {
        super(`Akses ditolak untuk operasi ${action} pada ${entity}`);
        this.name = "AuthorizationError";
    }
}

/** Throwing guard for protected operations (repository / mutation layer). */
export function assertCan(
    role: OrganizationRole | null | undefined,
    entity: RbacEntity,
    action: RbacAction,
): void {
    if (!can(role, entity, action)) throw new AuthorizationError(entity, action);
}

/**
 * Tenancy guard: an operation may never touch another organization.
 * Complements (never replaces) database RLS.
 */
export class TenancyError extends Error {
    readonly code = "ACCESS_DENIED";
    constructor() {
        super("Akses lintas organisasi ditolak");
        this.name = "TenancyError";
    }
}

export function assertSameOrganization(
    currentOrganizationId: string | null | undefined,
    resourceOrganizationId: string | null | undefined,
): void {
    if (!currentOrganizationId || !resourceOrganizationId) throw new TenancyError();
    if (currentOrganizationId !== resourceOrganizationId) throw new TenancyError();
}
