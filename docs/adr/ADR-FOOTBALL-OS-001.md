# ADR-FOOTBALL-OS-001

## Title
Football Identity as a Stable, Independent Domain Concept

## Status
Accepted

## Context
The current UI exposes a Football ID field in the player profile. The existing demo data uses a string value but does not define who issues it or how it relates to person, club, and membership records.

## Problem
The platform must avoid treating Football ID as a club identifier, user identifier, team identifier, or membership identifier. It must remain stable even if a player changes organization.

## Options Considered
- BolaID central issuer
- Federation-issued identity
- Delegated issuer model
- Hybrid issuer model

## Decision
Adopt a dedicated FootballIdentity concept as the authoritative stable identity record. It is separate from Person, Organization Membership, Team Membership, and Account.

## Rationale
This preserves longitudinal identity across organizational transfers and supports national-scale federation integration later without redefining identity whenever a membership changes.

## Consequences
- The platform must introduce a dedicated identity layer.
- Existing player-centric storage must be normalized.
- Current demo data becomes a simplified projection of the future model.

## Security Implications
Identity records require verifiable issuance and controlled access.

## Safeguarding Implications
Minor identity records require restricted access and audit logging.

## Data Implications
Football identity is a stable reference and should not be recreated on transfer.

## Migration Implications
Existing football_id field in the MVP data must be migrated into a dedicated identity model.

## Future Scalability
This model supports federation integration and multi-organization lifecycle management.

## Rejected Alternatives
- Treating Football ID as a club-local surrogate key
- Treating Football ID as a simple player attribute

## Dependencies
Q2 tenancy model, Q3 authorization model, Q9 safeguarding model

## Approval Required
Yes — requires stakeholder agreement on issuer authority and verification model.

## Related Capabilities
Identity, Membership, Player Profile

## Related UI
Player profile and identity reference display

## Related Open Questions
Q1, Q2, Q3, Q9
