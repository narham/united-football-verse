# Domain Model — Football OS

## Core Principle
The current UI is an experience layer. The domain model must preserve the distinction between:
- Person
- Football Identity
- Organization Membership
- Team Membership
- Competition Participation

## Identity

### Person
Aggregate root for a human being in the platform.
- Attributes: legal name, preferred name, birth date, contact channels
- Lifecycle: registered, verified, archived

### FootballIdentity
Stable identity record that survives organization and team changes.
- Not equal to club ID, user ID, team ID, or membership ID
- Issued by bolaID or a delegated authority, with verification status
- Lifecycle: issued, verified, corrected, revoked, superseded

### GuardianRelationship
Relationship between a minor and one or more legal guardians.
- Lifecycle: requested, accepted, revoked, expired

### Consent
Permission record for data processing and guardian access.
- Lifecycle: granted, withdrawn, expired, audited

## Organization

### Organization
Parent entity for SSB, academy, club, association, organizer, federation.
- Attributes: type, legal name, short name, region, status

### Membership
Time-bounded association between a Person and an Organization.
- Lifecycle: pending, active, suspended, transferred, ended
- Ownership and role are resolved through this aggregate

### Team
Contextual grouping inside an organization for training and competition.
- Lifecycle: created, active, archived

## Training

### TrainingSession
Planned training activity.
- Lifecycle: planned, confirmed, completed, cancelled

### Attendance
Attendance state for a player in a training session.
- Lifecycle: recorded, submitted, approved, corrected

## Competition

### Competition
Top-level competition container.
- Lifecycle: planned, active, closed

### Season
Temporal container for competition and performance history.
- Lifecycle: draft, active, closed

### Registration
Player registration for a competition or season.
- Lifecycle: submitted, confirmed, rejected, withdrawn

### Match
Football match with lifecycle and result semantics.
- Lifecycle: scheduled, confirmed, live, completed, postponed, cancelled, abandoned

### Venue
Physical or neutral venue for a match.
- Lifecycle: active, archived

## Finance

### Account
Chart-of-accounts entry for financial operations.

### Invoice
Invoice issued to a payer or organization.

### Payment
Payment against an invoice or account.

### Transaction
Journal-like movement with classification and audit trail.

## Communication

### Notification
Platform-generated message to a user or role.

### NotificationPreference
User preference for channel and delivery mode.

## Analytics

### PlayerStatistic
Seasonal or match-level performance data.

### TeamStatistic
Aggregated team-level performance data.

### OperationalMetric
Dashboard-ready operational measures.
