# Q1 — Football ID Authority Decision Paper

## Status
IN_REVIEW

## Problem
Football ID must remain stable across SSB, academy, club, competition, provincial, and national contexts. It must remain distinct from:
- Person
- Account
- Organization
- Organization Membership
- Team Membership

## Decision Context
The current architecture proposal defines FootballIdentity as a stable identity concept, but it does not yet determine the authoritative issuer or the governance model for issuance, verification, correction, and transfer.

## Options Considered

### Option A — bolaID as authoritative issuer
bolaID operates the identity authority directly and issues Football ID records for the ecosystem.

### Option B — Federation as authoritative issuer
PSSI or another federation authority is the legal and operational issuer of Football ID.

### Option C — Federation-rooted identity with bolaID as delegated issuer
The federation remains the authoritative root, while bolaID acts as delegated operational issuer and verifier.

### Option D — Hybrid authority model
Multiple authorities participate, with one root authority and one delegated operational layer.

## Evaluation Summary

| Criterion | A | B | C | D |
|---|---:|---:|---:|---:|
| Identity integrity | 4 | 4 | 5 | 4 |
| Organizational neutrality | 5 | 2 | 4 | 4 |
| Federation alignment | 3 | 5 | 5 | 4 |
| Operational feasibility | 4 | 2 | 4 | 3 |
| Uniqueness | 4 | 4 | 5 | 4 |
| Verification | 4 | 4 | 5 | 4 |
| Fraud resistance | 4 | 4 | 5 | 4 |
| Transfer handling | 5 | 3 | 4 | 4 |
| Duplicate resolution | 4 | 3 | 4 | 3 |
| Governance | 3 | 4 | 4 | 3 |
| National scalability | 5 | 4 | 5 | 4 |
| External interoperability | 4 | 4 | 5 | 4 |
| Implementation complexity | 3 | 2 | 3 | 2 |

## Recommendation
Recommend Option C — Federation-rooted identity with bolaID as delegated issuer.

## Why This Option Is Recommended
- It preserves national and federation alignment while allowing bolaID to operate the ecosystem-facing identity layer.
- It supports stable identity across organizational transfers.
- It creates a clear governance chain for issuance, verification, correction, and retirement.
- It reduces the risk of a purely platform-centric identity model becoming disconnected from external football governance.

## Why Other Options Are Rejected
- Option A is operationally efficient but may be seen as insufficiently aligned with football governance authority.
- Option B is strongly aligned with federation governance but may be too slow and too centralized for ecosystem operations.
- Option D adds governance complexity without clear benefit over a rooted and delegated model.

## Football ID Lifecycle
Requested
→ Verified
→ Issued
→ Active
→ Suspended
→ Corrected
→ Retired

## Lifecycle Rules
- Football ID should not be deleted in normal operation.
- Retired may be used when the identity is superseded or invalidated.
- Corrections must preserve a traceable audit trail.
- Duplicate identities must be resolved via authoritative review, not by silent overwrite.

## Verification Model
- Verification requires authoritative evidence and issuer approval.
- Issuer and verifier roles must be separate where possible.
- Verification status should be recorded explicitly.

## Authority Hierarchy
- Federation authority defines the root identity governance.
- bolaID acts as delegated operational issuer and verifier.
- Organization membership does not redefine the identity itself.

## Decision Required
Human governance must decide whether this recommendation is accepted or whether an alternative authority model should be adopted.
