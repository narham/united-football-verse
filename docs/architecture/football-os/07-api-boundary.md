# API Boundary — Football OS

## Conceptual Boundary Model
The API should be organized around bounded contexts rather than UI routes.

## Identity
- GET /football-identities/{id}
- GET /people/{id}
- GET /people/{id}/guardians
- POST /consents

## Organization
- GET /organizations/{id}
- GET /organizations/{id}/members
- GET /organizations/{id}/teams
- GET /organizations/{id}/staff

## Training
- GET /organizations/{id}/training-sessions
- GET /training-sessions/{id}/attendance
- POST /training-sessions/{id}/attendance

## Competition
- GET /competitions/{id}
- GET /competitions/{id}/matches
- GET /competitions/{id}/registrations

## Finance
- GET /organizations/{id}/transactions
- GET /organizations/{id}/invoices
- POST /organizations/{id}/payments

## Communication
- GET /notifications
- POST /notifications/preferences

## Analytics
- GET /organizations/{id}/dashboard
- GET /players/{id}/statistics
