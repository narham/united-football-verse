# Authorization Model — Football OS

## Decision
Adopt RBAC with organization-scoped permissions rather than a flat user-role model.

## Core Model
Person + Account + Membership + Role + Permission + Organization Scope

## Roles
- Owner
- Manager
- Coach
- Staff
- Finance
- Guardian
- Player
- Referee
- Organizer
- Association Official
- Platform Administrator

## Permission Principles
- Roles are assigned through Membership, not directly to a Person-only identity.
- Permissions inherit from role templates but are constrained by organization scope and team scope.
- Sensitive data requires explicit elevated permission.
- Guardians receive minimum necessary read access to their minor’s data only.

## Scope Model
- Organization scope: the organization the user belongs to
- Team scope: a team inside the organization
- Competition scope: a competition or season inside an organization

## Access Rules
- Owner and Manager can manage organization structure and core operational data.
- Coach can manage training, attendance, and team activities within assigned scope.
- Finance can manage financial records within approved scope.
- Guardian can view their minor's schedule and attendance only when consent permits.
- Player can view own profile and assigned participation data.
- Platform Administrator can manage cross-organization platform concerns with audit.
