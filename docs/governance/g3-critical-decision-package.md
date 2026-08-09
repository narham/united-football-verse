# G3 Critical Decision Package — Football OS

## Executive Summary
This package prepares four critical architecture decisions for human governance review:
- Q1 Football ID authority
- Q2 Multi-tenancy and cross-organization access
- Q3 Authorization model
- Q9 Safeguarding and U-18 data

The current state remains G3 FAIL / BLOCKED because these questions are not yet approved by an explicit authority.

## Current G3 Status
FAIL / BLOCKED

## Approval Authority Status
APPROVAL AUTHORITY = NOT YET DEFINED

## Q1 Decision
Recommendation: Federation-rooted identity with bolaID as delegated issuer.

## Q2 Decision
Recommendation: Hybrid tenancy with organization as the primary tenant boundary, membership and role as the access-control boundary, and platform-level access only through explicit privileged scope.

## Q3 Decision
Recommendation: RBAC as the baseline, with contextual authorization policies layered on top of role assignment.

## Q9 Decision
Recommendation: Treat safeguarding as a constitutional policy and access-control requirement, with purpose-limited consent and strict minor-data controls.

## Cross-Decision Consistency
The proposed model aligns identity, membership, organization, role, scope, permission, and safeguarding into a consistent governance chain. The key point is that identity remains stable while organization membership and role scope change.

## Risk Summary
The main risks are identity duplication, cross-tenant leakage, authorization bypass, minor-data exposure, and governance ambiguity.

## National Scale Assessment
The proposed model is more suitable for national-scale growth than a club-centric model because it separates identity, organization membership, and role scope. However, the governance authority must still be defined for approval and oversight.

## Recommended Governance Actions
1. Define the approval authority explicitly.
2. Review the four decision papers.
3. Record explicit approval evidence in the governance register.
4. Update ADR status only after human approval evidence exists.

## Approval Checklist
- [ ] Q1 reviewed
- [ ] Q1 approved by authorized authority
- [ ] Q2 reviewed
- [ ] Q2 approved by authorized authority
- [ ] Q3 reviewed
- [ ] Q3 approved by authorized authority
- [ ] Q9 reviewed
- [ ] Q9 approved by authorized authority
- [ ] Approval authority confirmed
- [ ] Decision register updated
- [ ] ADRs updated
- [ ] Architecture baseline updated
- [ ] G3 gate reviewed
