# Governance Charter — Football OS

## Status
PROPOSED — PENDING HUMAN APPROVAL

## Purpose
This charter defines the minimum viable governance model for bolaID Football OS so that architecture and safeguarding decisions can be made without creating unnecessary bureaucracy.

## Governance Principle
The project must distinguish:
- Recommendation
- Decision
- Approval
- Implementation

AI may recommend and analyze. Human authority must decide and approve.

## Governance Layers
The minimum viable governance model includes:
- Product Authority
- Architecture Authority
- Security / Safeguarding Authority
- Engineering Authority

## Roles
- [Product Authority]: responsible for product scope, roadmap, and business priorities
- [Architecture Authority]: responsible for architecture principles, ADR review, architecture exceptions, and major technical direction
- [Security / Safeguarding Authority]: responsible for authorization, safeguarding, PII, consent, and security exceptions
- [Engineering Authority]: responsible for implementation standards, quality, and execution

## Governance Model
The model is lightweight and intended to support:
- early-stage product development
- multiple organizations and clubs
- competition organizers
- provincial and national scale

## Decision Rule
Critical architecture decisions require review by at least the relevant authority domains. No decision is considered approved until there is explicit approval evidence recorded in the governance register.

## Approval Evidence
Valid approval evidence includes:
- signed governance record
- approved ADR
- recorded decision meeting
- formal resolution

Invalid evidence includes:
- AI recommendation alone
- developer comment
- PR approval alone
- unrecorded chat discussion

## Review Cadence
- Critical architecture decisions should be reviewed before implementation readiness.
- High-risk safeguarding and authorization decisions should be reviewed before any production or sensitive-data handling workflow.
