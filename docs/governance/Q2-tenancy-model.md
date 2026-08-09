# Q2 — Multi-Tenancy Decision Paper

## Status
IN_REVIEW

## Problem
The platform must support multiple organizational forms and cross-organization operations without allowing unauthorized data access. The current proposal is shared database plus organization-scoped access, but governance must define the tenancy model more explicitly.

## Decision Context
The platform must operate across SSB, academy, club, organizer, association, provincial federation, national federation, and platform administration contexts.

## Recommended Model
Recommend a hybrid model:
- Shared database for platform efficiency
- Organization as the primary tenant boundary
- Membership and role as the access-control boundary
- Platform-level access only through explicit privileged scopes

## Organization Definition
An organization is a legal or operational business entity that can own teams, competitions, memberships, and records.

## Tenant Definition
Each organization is a tenant for operational data access. The platform itself is not a tenant in the same sense; it is a shared control plane.

## Membership Model
A person gains access through membership in an organization. Membership establishes the baseline access relationship.

## Scope Model
- Platform scope: platform administration only
- Organization scope: operational records within one organization
- Team scope: team activities within an organization
- Competition scope: competition data within scope of a competition
- Individual scope: data directly related to an individual subject

## Cross-Organization Scenarios

### Coach at multiple organizations
A coach may be granted access to multiple organizations through distinct memberships. Access must be scoped to each organization and role.

### Player transfer
A player transfer changes membership, not identity. The player’s FootballIdentity remains stable.

### Association official
An association official may require multi-organization read access, but this should not imply unrestricted write access.

### Guardian
A guardian may have children in multiple organizations. Access must be purpose-bound and child-specific.

### Platform administrator
A platform administrator may access operational data for support purposes, but this must not become automatic business ownership of every organization.

## Security Test
Scenario:
- Organization A user requests Organization B player data
Expected result:
- DENY unless explicit cross-organization authority exists

## Authorization Chain
- Person
- Account
- Membership
- Role
- Permission
- Scope
- Policy

## Recommendation
Adopt organization-scoped tenancy with explicit membership and role-based governance. Avoid database-per-tenant complexity for the initial architecture while preserving clear isolation rules.

## Decision Required
Human governance must confirm whether this tenancy model is acceptable or whether a stricter hierarchy is required.
