# Decision Summary — Football OS

## Q1 Football ID
Decision: ACCEPTED — Football ID is a stable, immutable identity reference separate from club, user, team, and membership identifiers. It is issued by a trusted authority and verified through a dedicated identity lifecycle.

## Q2 Multi-Tenancy
Decision: ACCEPTED — Adopt a hybrid model: shared database, organization-scoped tenancy, and explicit role-based access control.

## Q3 Authorization
Decision: ACCEPTED — Use RBAC with organization-scoped permissions and membership-based role assignments.

## Q4 Season
Decision: ACCEPTED — Season is an explicit lifecycle entity with start/end dates and contextual participation rules.

## Q5 Finance
Decision: ACCEPTED — Target a hybrid finance model that starts with ledger-like transaction support but is designed to evolve toward invoice, payment, and accounting structures.

## Q6 Attendance
Decision: ACCEPTED — Attendance is a stateful lifecycle record tied to a training session and a player, with correction and approval semantics.

## Q7 Match
Decision: ACCEPTED — Match lifecycle includes scheduled, confirmed, live, completed, postponed, cancelled, and abandoned; score is required only for completed matches.

## Q8 Age Group
Decision: ACCEPTED — Age categories are contextual to season and competition rather than hard-coded into player identity.

## Q9 Safeguarding / PII
Decision: ACCEPTED — Protect minors with role-limited access, guardian-based consent, and restricted access to safeguarded fields.

## Q10 Client State
Decision: ACCEPTED — Use route state and server state for data, with React state reserved for transient UI concerns.

## Q11 Persistence
Decision: ACCEPTED — Only non-sensitive preferences should be persisted locally; sensitive data must remain server-authoritative.

## Q12 Notifications
Decision: ACCEPTED — Use an in-app notification core with future extensibility for email and WhatsApp.
