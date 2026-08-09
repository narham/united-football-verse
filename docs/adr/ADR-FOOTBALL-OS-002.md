# ADR-FOOTBALL-OS-002

## Title
Hybrid Tenancy with Organization-Scoped Access Control

## Status
Accepted

## Context
The platform serves SSB, academy, club, association, organizer, and federation actors. The current MVP assumes a single club context with simple ownership-based access.

## Problem
A single shared-club assumption is insufficient for multiple organizations and cross-organization workflows.

## Options Considered
- Shared database with row-level isolation
- Schema-per-tenant
- Database-per-tenant
- Hybrid model

## Decision
Adopt a hybrid tenancy model: shared PostgreSQL database, organization-scoped tenancy, and explicit role-based access control.

## Rationale
This balances simplicity, cost, and national-scale extensibility. It avoids the operational overhead of isolated databases while providing clear tenant boundaries through organization membership and scoped permissions.

## Consequences
- Every protected resource must include organization scope.
- Access policies must be more explicit than a single-club owner check.
- Cross-organization access requires explicit governance.

## Security Implications
The tenancy model is the foundation for secure multi-organization access.

## Safeguarding Implications
Tenant boundaries reduce the chance of unauthorized access to minors’ data across organizations.

## Data Implications
Data ownership and visibility become organization-scoped rather than club-scoped.

## Migration Implications
Current examples using club_id as the sole ownership boundary must be revised to organization membership.

## Future Scalability
This model can scale to regional and national federations without a re-architecture of the core platform.

## Rejected Alternatives
- Single-club ownership-only access
- Full database-per-tenant isolation for the initial architecture

## Dependencies
Q1 football identity, Q3 authorization, Q9 safeguarding

## Approval Required
Yes — requires governance confirmation of organization boundaries and cross-organization access rules.

## Related Capabilities
Organization Profile, Team Management, Membership

## Related UI
Settings, roster, and organization-switching experiences

## Related Open Questions
Q2, Q3, Q9
