# Q9 — Safeguarding & U-18 Data Decision Paper

## Status
IN_REVIEW

## Problem
Minors are protected subjects. Their data must be handled with stricter controls than ordinary operational data. Guardian authority does not automatically imply unrestricted access.

## Architectural Principle
When guardian preference, organizational convenience, professional interest, or platform convenience conflicts with the legitimate protection and welfare of the child, the child’s interest takes precedence, subject to law and legitimate safeguarding procedures.

## Data Subject Model
- Minor
- Guardian
- Coach
- Staff
- Association
- Organization
- Platform

## Relationship Model
- Child is linked to one or more guardians through explicit relationship records.
- Consent governs permitted access and processing.
- Professional roles may access only the minimum data required for legitimate duties.
- Organization and platform roles do not override safeguarding controls.

## Consent Model
- Consent must be purpose-specific.
- Consent may expire.
- Consent may be withdrawn.
- Historical consent must be retained for audit.
- Evidence of consent must be stored.
- Emergency handling may override normal consent procedures only under defined safeguarding policy.

## Definitive Data Classification

| Data | Classification |
|---|---|
| Player name | PERSONAL |
| Football ID | CONFIDENTIAL |
| Date of birth | PROTECTED-MINOR |
| Photo | PROTECTED-MINOR |
| Guardian contact | PROTECTED-MINOR |
| Address | PROTECTED-MINOR |
| Identity documents | HIGHLY-PROTECTED |
| Birth certificate | HIGHLY-PROTECTED |
| Performance assessment | SENSITIVE |
| Training attendance | SENSITIVE |
| Competition data | CONFIDENTIAL |
| Financial data | CONFIDENTIAL |
| Consent records | HIGHLY-PROTECTED |

## Visibility Matrix

| Data | Guardian | Coach | Manager | Finance | Association | Platform |
|---|---|---|---|---|---|---|
| Player name | Limited | Limited | Limited | No | Limited | No |
| Football ID | Limited | Limited | Limited | No | Limited | No |
| Date of birth | Limited | Limited | Limited | No | No | No |
| Photo | Limited | Limited | Limited | No | No | No |
| Guardian contact | Limited | No | No | No | No | No |
| Identity documents | No | No | No | No | No | No |
| Performance assessment | No | Limited | Limited | No | Limited | No |
| Training attendance | Limited | Limited | Limited | No | Limited | No |
| Consent records | Limited | No | No | No | No | No |

## Threat Model

| Threat | Attack Vector | Impact | Likelihood | Mitigation | Residual Risk |
|---|---|---|---|---|---|
| Compromised guardian account | Account takeover | Unauthorized access to child data | Medium | MFA, purpose-bound access, audit | Medium |
| Compromised coach account | Account takeover | Exposure of attendance or assessment data | Medium | MFA, least privilege, audit | Medium |
| Malicious organization administrator | Privilege abuse | Broad unauthorized access | Medium | Separation of duties, approval, audit | Medium |
| Cross-organization access | Improper scope | Exposure across organizations | Medium | Membership-scoped access and policy checks | Medium |
| Public URL exposing protected document | Link leakage | Data disclosure | Medium | Signed URLs, access control, expiry | Medium |
| Bulk export of minor records | Over-privileged export | Data exposure | Medium | Export approval, audit, minimization | Medium |
| Administrator overreach | Excessive access | Privacy violation | Medium | Justification, approval, review | Medium |

## Recommendation
Safeguarding must be treated as a constitutional policy and access-control requirement, not as a secondary database concern. Guardian access must be purpose-limited and scoped by consent and role.

## Decision Required
Human governance must confirm whether the proposed safeguarding principles are sufficient and whether stricter controls are required for documents and export operations.
