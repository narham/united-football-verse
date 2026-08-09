# Q3 — Authorization Model Decision Paper

## Status
IN_REVIEW

## Problem
The platform requires a secure authorization structure for owners, managers, coaches, staff, finance, guardians, players, referees, organizers, association officials, and platform administrators. The current proposal uses RBAC with organization-scoped permissions, but governance must confirm whether additional contextual authorization is required.

## Recommended Structure
Person
↓
Account
↓
Membership
↓
Role
↓
Permission
↓
Scope
↓
Policy

## Role Model

| Role | Purpose | Org Scope | Team Scope | Competition Scope | Sensitive Data | Minor Data | Write | Delete | Audit |
|---|---|---|---|---|---|---|---|---|---|
| Platform Administrator | Platform support and administration | Yes | Limited | Limited | Yes | Yes | Limited | Limited | Required |
| Association Official | Oversight of competitions and organization relationships | Yes | Limited | Yes | Limited | Limited | Limited | No | Required |
| Organization Owner | Owns organization governance | Yes | Yes | Yes | Yes | Yes | Yes | Limited | Required |
| Organization Manager | Runs daily administration | Yes | Yes | Yes | Yes | Yes | Yes | Limited | Required |
| Coach | Manages team training and attendance | Yes | Yes | Limited | Limited | Limited | Yes | No | Required |
| Team Staff | Supports team operations | Yes | Yes | Limited | Limited | Limited | Limited | No | Required |
| Finance Staff | Manages financial operations | Yes | Limited | Limited | Yes | No | Yes | Limited | Required |
| Competition Organizer | Runs competition structure | Yes | Limited | Yes | Limited | No | Yes | No | Required |
| Referee | Participates in competition operations | Limited | Limited | Yes | Limited | No | Limited | No | Required |
| Guardian | Supports a linked child | Limited | Limited | Limited | Limited | Yes | No | No | Required |
| Player | Access to own record and participation | Limited | Limited | Limited | Limited | Limited | Limited | No | Required |

## Contextual Authorization Requirements
Pure RBAC is insufficient where access depends on:
- assigned team membership
- competition participation
- guardian-child relationship
- purpose-specific consent
- protected minor data restrictions
- finance segregation

## Policy Examples
- Coach may view assigned team players, but not all players in the organization.
- Guardian may view a linked child’s permitted data, but cannot modify coach assessments.
- Finance staff may access finance data but not protected development notes.
- Association official may see competition data across organizations but cannot edit organization records.

## Authorization Matrix

| Role | Scope | Resource | Read | Create | Update | Delete | Sensitive | Minor |
|---|---|---|---|---|---|---|---|---|
| Coach | Team | Training attendance | Yes | Yes | Yes | No | No | Limited |
| Guardian | Individual | Child profile | Yes | No | No | No | No | Yes |
| Finance Staff | Organization | Finance records | Yes | Yes | Yes | Limited | Yes | No |
| Association Official | Competition | Competition data | Yes | Limited | Limited | No | Limited | No |
| Player | Individual | Own profile | Yes | No | Limited | No | No | Limited |

## Recommendation
Adopt RBAC as the baseline, but require contextual authorization policies layered on top of role assignment.

## Decision Required
Human governance must confirm whether this hybrid authorization structure is sufficient or whether a more formal ABAC-based policy layer is required.
