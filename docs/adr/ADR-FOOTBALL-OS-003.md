# ADR-FOOTBALL-OS-003

## Title
RBAC with Organization-Scoped Permissions

## Status
Accepted

## Context
The platform will support owners, managers, coaches, staff, finance, guardians, players, officials, and administrators. The demo model uses a single owner-centric assumption that is too narrow for real operational needs.

## Problem
Role handling cannot be modeled as a single user-to-role mapping. Access must be contextual to organization, team, competition, and data sensitivity.

## Options Considered
- Simple RBAC
- ABAC only
- RBAC with organization-scoped permissions

## Decision
Adopt RBAC with organization-scoped permissions and membership-based role assignments.

## Rationale
This provides sufficient control for operational workflows without overcomplicating implementation. It also supports the future use of contextual permissions for teams and competitions.

## Consequences
- Permissions are resolved from membership and role context.
- Guardians and players receive limited access by design.
- The platform must separate account, person, membership, and role concepts.

## Security Implications
This is the primary mechanism for controlling read/write access to protected and sensitive data.

## Safeguarding Implications
Guardians and minors receive role-limited access rather than unrestricted visibility.

## Data Implications
Sensitive data and minors’ data require additional policy checks beyond general role assignment.

## Migration Implications
The current single-club owner assumption must evolve into membership-based authorization.

## Future Scalability
This design can expand into team-level and competition-level permissions as the ecosystem grows.

## Rejected Alternatives
- User equals role
- Pure ABAC without role templates

## Dependencies
Q2 tenancy, Q9 safeguarding

## Approval Required
Yes — requires governance agreement on role templates and minimum permission boundaries.

## Related Capabilities
Staff Management, Player Profile, Finance, Training

## Related UI
Role-based management screens and restricted views

## Related Open Questions
Q3, Q9
