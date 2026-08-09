# Bounded Context Map — Football OS

## Contexts

### Identity Context
Owns Person, FootballIdentity, GuardianRelationship, Consent.
- Responsible for stable identity and regulated access
- Supports player, staff, guardian, official, and organization relationships

### Organization Context
Owns Organization, Membership, Team, Staff.
- Responsible for ownership, roles, and operational boundaries

### Training Context
Owns TrainingSession and Attendance.
- Responsible for session planning and attendance lifecycle

### Competition Context
Owns Season, Competition, Registration, Match, Venue.
- Responsible for competition participation and match outcomes

### Finance Context
Owns Account, Invoice, Payment, Transaction.
- Responsible for money movement and financial control

### Communication Context
Owns Notification and NotificationPreference.
- Responsible for user communications and delivery preferences

### Analytics Context
Owns PlayerStatistic, TeamStatistic, OperationalMetric.
- Responsible for read-models and dashboard summaries

## Context Boundaries
- Identity is the authoritative root for stable person and football identity data.
- Organization is the authoritative root for memberships and role scopes.
- Competition depends on Organization and Identity for participation and eligibility.
- Training depends on Organization and Identity for attendance ownership.
- Finance depends on Organization and, where required, Membership or role boundaries.
- Analytics is a read-model context derived from the operational domains.
