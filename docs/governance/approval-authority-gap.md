# Approval Authority Gap — Football OS

## Status
PROPOSED — PENDING HUMAN APPROVAL

## Problem
The repository contains architecture proposals and governance review artifacts, but it does not contain an explicit approval authority for the critical architecture decisions.

## Why This Matters
Without a named authority, the architecture package cannot move from proposal to approved governance baseline. This blocks the G3 gate for the critical decisions Q1, Q2, Q3, and Q9.

## Decisions Blocked by the Gap
- Q1 Football ID authority and issuance governance
- Q2 Multi-tenancy and cross-organization access governance
- Q3 Authorization model and role scope governance
- Q9 Safeguarding and U-18 data governance

## Proposed Authority Model
A governance authority should be established with the ability to ratify architecture decisions for identity, access, tenancy, and safeguarding.

## Proposed Membership Roles
- Product Owner or business sponsor
- Enterprise Architect
- Security Architect
- Privacy/Safeguarding Architect
- Domain Architect
- Data Architect

## Proposed Decision Rights
- Approve or reject critical architecture decisions
- Require revisions before approval
- Record explicit approval evidence in the repository

## Proposed Quorum
A simple quorum should be defined, such as:
- at least 3 voting members
- at least 1 security/privacy representative
- at least 1 business sponsor representative

## Proposed Approval Mechanism
- Decision review in writing
- Explicit approval record in the governance register
- ADR status changed only after explicit approval evidence exists

## Proposed Record Format
Each decision should capture:
- decision title
- proposed decision
- rationale
- risk summary
- approval status
- approval authority
- approval date

## Governance Conclusion
The approval authority is not yet defined in the repository. The governance model above is proposed and must be ratified by human authority before it can become the operative approval framework.
