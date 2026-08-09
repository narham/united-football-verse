# Database Readiness — Football OS

## Classification of Existing Tables

| Table / Entity | Classification | Reason |
|---|---|---|
| clubs | MODIFY | Needs organization-type and tenancy model extension |
| players | SPLIT | Must be separated from identity and membership concepts |
| player_stats | MODIFY | Should be tied to season and competition context |
| staff | MODIFY | Must be role-and-membership based rather than club-only |
| training_sessions | MODIFY | Needs organization/team/season context |
| attendances | MODIFY | Needs lifecycle and approval semantics |
| competitions | MODIFY | Needs season and competition-type modeling |
| matches | MODIFY | Needs match lifecycle and venue invariants |
| transactions | SPLIT | Must be separated into ledger/accounting concepts |

## Key Architectural Changes Required
- Introduce a dedicated identity layer for Person and FootballIdentity.
- Replace single-club ownership assumptions with Organization Membership.
- Introduce Season as an explicit lifecycle entity.
- Introduce safeguarding-specific data handling and restricted access patterns.
- Separate accounting concepts from simple transaction storage.

## Current MVP Simplification to Preserve as Legacy
The existing players.club_id relationship is an MVP simplification and must not become the permanent enterprise model.
