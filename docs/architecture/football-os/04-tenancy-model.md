# Tenancy Model — Football OS

## Decision
Adopt a hybrid tenancy model:
- Shared PostgreSQL database for platform efficiency
- Organization-scoped tenancy and row-level access control for security
- Explicit platform-level access for cross-organization oversight

## Rationale
This supports SSB, academy, club, association, organizer, and federation use cases without forcing a separate database per organization. It also preserves national-scale extensibility while keeping the architecture simpler than full multi-database isolation.

## Tenant Boundary
Primary tenant boundary = Organization.
Secondary boundary = Team and Competition within an organization.

## Ownership Model
- Organization owns its operational domain data.
- Platform-level reference data is shared.
- Cross-organization access requires explicit membership and permission.

## Tenant Resolution Strategy
Tenant context is derived from:
1. Current organization selection in the UI
2. Organization membership of the acting account
3. Role and permission scope

## Security Consequence
All protected resources must be scoped by organization membership and role. Platform administrators may access cross-organization data only through elevated and audited pathways.
