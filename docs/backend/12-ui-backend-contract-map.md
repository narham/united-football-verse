# UI → Backend Contract Traceability Map

**Status:** SPECIFICATION ONLY  
**Date:** 2026-08-09  
**Purpose:** Map every major UI capability to backend query/command and API endpoint

---

## Route Mapping Matrix

### Route 1: `/` Dashboard

| UI Component | Capability | Query/Command | API Endpoint | Status |
|---|---|---|---|---|
| KPI: Pemain Aktif | CAP-ORG-004 | ListPlayers (filter status=ACTIVE) | GET /organizations/{org}/players?status=ACTIVE | READY |
| KPI: Latihan/Minggu | CAP-TRN-001 | ListTrainingSessions | GET /organizations/{org}/training-sessions | READY |
| KPI: Rekam W-D-L | CAP-CMP-003 | GetMatchRecord (aggregated) | GET /competitions/{comp}/standing | READY |
| KPI: Saldo Klub | CAP-FIN-001 | GetFinancialSummary | GET /organizations/{org}/finance/summary | READY |
| Upcoming Training | CAP-TRN-001 | ListUpcomingTraining | GET /organizations/{org}/training-sessions?from_date=today | READY |
| Latest Matches | CAP-CMP-002 | ListMatches (recent) | GET /competitions/{comp}/matches?sort=-date&limit=5 | READY |
| Player Roster Snapshot | CAP-ORG-004 | ListPlayers (limit 8) | GET /organizations/{org}/players?limit=8 | READY |
| Finance Summary | CAP-FIN-001 | GetTransactionSummary | GET /organizations/{org}/transactions/summary | READY |

---

### Route 2: `/pemain` Player Roster

| UI Component | Capability | Query/Command | API Endpoint | Status |
|---|---|---|---|---|
| Player Search | CAP-ORG-004 | ListPlayers (search) | GET /organizations/{org}/players?search={query} | READY |
| Filter Position | CAP-ORG-004 | ListPlayers (filter position) | GET /organizations/{org}/players?position={GK\|DF\|MF\|FW} | READY |
| Filter Status | CAP-ORG-004 | ListPlayers (filter status) | GET /organizations/{org}/players?status={ACTIVE\|RESERVE\|INJURED} | READY |
| Player Table/Cards | CAP-ORG-004 | ListPlayers (paginated) | GET /organizations/{org}/players?page=1&limit=20 | READY |
| Empty State | CAP-ORG-004 | (handled by 0-result response) | Same endpoint | READY |

---

### Route 3: `/pemain/$id` Player Detail Profile

| UI Component | Capability | Query/Command | API Endpoint | Status |
|---|---|---|---|---|
| Player Hero Card | CAP-ID-001 | GetPlayer | GET /organizations/{org}/players/{playerId} | READY |
| Football ID Display | CAP-ID-002 | (part of GetPlayer response) | Same endpoint | READY |
| Season Stats Table | CAP-ANL-002 | GetPlayerStats | GET /organizations/{org}/players/{playerId}/stats | READY |
| Performance Summary | CAP-ANL-002 | (computed from stats) | Same endpoint | READY |
| Activity/History Tab | CAP-TRN-003, CAP-CMP-003 | GetPlayerAttendance, GetPlayerMatches | GET /organizations/{org}/players/{playerId}/attendance GET /organizations/{org}/players/{playerId}/matches | READY |
| Safeguarding Info | CAP-ID-003 (U-18) | CheckGuardianConsent | GET /organizations/{org}/players/{playerId}/consents | PENDING Q9 |

---

### Route 4: `/latihan` Training Schedule

| UI Component | Capability | Query/Command | API Endpoint | Status |
|---|---|---|---|---|
| Weekly Schedule | CAP-TRN-001 | ListTrainingSessions | GET /organizations/{org}/training-sessions?season={id} | READY |
| Session Details | CAP-TRN-002 | GetTrainingSession | GET /organizations/{org}/training-sessions/{sessionId} | READY |
| Attendance Snapshot | CAP-TRN-003 | GetAttendanceSummary (this week) | GET /organizations/{org}/training-sessions/{sessionId}/attendance?date_range=this_week | READY |
| Session Notes | CAP-TRN-002 | (part of GetTrainingSession) | Same endpoint | READY |

---

### Route 5: `/tim` Team Overview

| UI Component | Capability | Query/Command | API Endpoint | Status |
|---|---|---|---|---|
| KPI: Active Players | CAP-ORG-004 | ListPlayers (team, status=ACTIVE) | GET /teams/{teamId}/players?status=ACTIVE | READY |
| KPI: Goals Season | CAP-ANL-002 | GetTeamSeasonStats | GET /teams/{teamId}/stats/{season} | READY |
| Roster (first 8) | CAP-ORG-004 | ListTeamPlayers (limit 8) | GET /teams/{teamId}/players?limit=8 | READY |
| Top Scorers | CAP-ANL-002 | GetTopScorers | GET /teams/{teamId}/top-scorers?season={id} | READY |

---

### Route 6: `/staf` Staff Management

| UI Component | Capability | Capability | Query/Command | API Endpoint | Status |
|---|---|---|---|---|
| Staff KPI | CAP-ORG-003 | ListStaff (count) | GET /organizations/{org}/staff?count_only=true | READY |
| Staff Directory | CAP-ORG-003 | ListStaff | GET /organizations/{org}/staff | READY |
| Staff Card (name, role, phone) | CAP-ORG-003 | (part of ListStaff) | Same endpoint | READY |

---

### Route 7: `/musim` Season Overview

| UI Component | Capability | Query/Command | API Endpoint | Status |
|---|---|---|---|---|
| Season KPI | CAP-ORG-002 | GetSeasonStats | GET /organizations/{org}/seasons/{seasonId}/stats | READY |
| Milestone List | CAP-ORG-002 | (demo data / organizational milestones) | Organizational context, no direct endpoint | READY |
| Competitions List | CAP-CMP-001 | ListCompetitionSeasons | GET /competitions?season={seasonCode} | READY |

---

### Route 8: `/kompetisi` Competitions & Matches

| UI Component | Capability | Query/Command | API Endpoint | Status |
|---|---|---|---|---|
| W-D-L Summary | CAP-CMP-003 | GetMatchRecord | GET /competitions/{id}/record | READY |
| Active Competitions | CAP-CMP-001 | ListCompetitions (active) | GET /organizations/{org}/competitions?status=ACTIVE | READY |
| Match Result Cards | CAP-CMP-002, CAP-CMP-003 | ListMatches (completed) | GET /competitions/{id}/matches?status=COMPLETED | READY |
| Upcoming Matches | CAP-CMP-002 | ListMatches (scheduled) | GET /competitions/{id}/matches?status=SCHEDULED | READY |

---

### Route 9: `/kompetisi/$id` Match Detail

| UI Component | Capability | Query/Command | API Endpoint | Status |
|---|---|---|---|---|
| Match Header | CAP-CMP-002 | GetMatch | GET /matches/{matchId} | READY |
| Match Score | CAP-CMP-003 | (part of GetMatch) | Same endpoint | READY |
| Teams & Result | CAP-CMP-002, CAP-CMP-003 | (part of GetMatch) | Same endpoint | READY |
| Lineup Notes | CAP-CMP-002 | GetLineup | GET /matches/{matchId}/lineup | READY |
| Tactical Notes | CAP-CMP-002 | (optional JSON field in match) | Same endpoint | READY |

---

### Route 10: `/keuangan` Finance Summary

| UI Component | Capability | Query/Command | API Endpoint | Status |
|---|---|---|---|---|
| KPI: Income | CAP-FIN-001 | GetFinancialSummary (income) | GET /organizations/{org}/finance/summary | READY |
| KPI: Expense | CAP-FIN-001 | GetFinancialSummary (expense) | GET /organizations/{org}/finance/summary | READY |
| KPI: Balance | CAP-FIN-001 | GetFinancialSummary (balance) | GET /organizations/{org}/finance/summary | READY |
| Transaction List | CAP-FIN-002 | ListTransactions | GET /organizations/{org}/transactions?limit=20 | READY |
| Demo Mode Notice | (none) | (frontend only) | N/A | READY |

---

### Route 11: `/keuangan/$id` Transaction Detail

| UI Component | Capability | Query/Command | API Endpoint | Status |
|---|---|---|---|---|
| Transaction Header | CAP-FIN-002 | GetTransaction | GET /organizations/{org}/transactions/{transactionId} | READY |
| Category Badge | CAP-FIN-002 | (part of GetTransaction) | Same endpoint | READY |
| Amount / Date | CAP-FIN-002 | (part of GetTransaction) | Same endpoint | READY |
| Description | CAP-FIN-002 | (part of GetTransaction) | Same endpoint | READY |

---

### Route 12: `/notifikasi` Notifications

| UI Component | Capability | Query/Command | API Endpoint | Status |
|---|---|---|---|---|
| Notification List | (CAP-TRN → trigger) | ListNotifications | GET /users/{userId}/notifications | DEMO |
| Notification Card | (demo) | (demo data) | N/A in demo mode | DEMO |
| Demo Notice | (none) | (frontend only) | N/A | READY |

---

### Route 13: `/aktivitas` Activity Timeline

| UI Component | Capability | Query/Command | API Endpoint | Status |
|---|---|---|---|---|
| Activity Feed | (operational activity) | ListActivityFeed | GET /organizations/{org}/activity-feed | DEMO |
| Activity Card | (demo) | (demo data) | N/A in demo mode | DEMO |
| Demo Notice | (none) | (frontend only) | N/A | READY |

---

### Route 14: `/pengaturan` Settings

| UI Component | Capability | Query/Command | API Endpoint | Status |
|---|---|---|---|---|
| Club Profile | CAP-ORG-001 | GetOrganization | GET /organizations/{org} | READY |
| Club Edit Fields | CAP-ORG-001 | UpdateOrganization | PATCH /organizations/{org} | READY |
| Theme Switcher | CAP-ORG-002 | UpdateUserPreference | PATCH /users/{userId}/preferences | READY |
| Staff Count | CAP-ORG-003 | CountStaff | GET /organizations/{org}/staff?count_only=true | READY |
| System Info | (none) | (frontend only) | N/A | READY |
| Demo Mode Info | (none) | (frontend only) | N/A | READY |

---

## Aggregated Readiness

| Capability | Routes | Status | Blockers |
|---|---|---|---|
| CAP-ORG-001 Organization Profile | /pengaturan | READY | None |
| CAP-ORG-002 Organization Configuration | /pengaturan, /musim | READY | None |
| CAP-ORG-003 Staff Management | /staf, /pengaturan, / | READY | None |
| CAP-ORG-004 Team Management | /, /pemain, /tim | READY | None |
| CAP-ID-001 Player Profile | /pemain/$id | READY | None |
| CAP-ID-002 Football Identity | /pemain/$id | READY | Q1 (format) |
| CAP-ID-003 Player Membership | /pemain/$id (safeguarding) | PARTIAL | Q9 |
| CAP-TRN-001 Training Schedule | /latihan, / | READY | None |
| CAP-TRN-002 Training Session Mgmt | /latihan | READY | Q6 (semantics) |
| CAP-TRN-003 Attendance | /latihan (snapshot only) | DEMO | Q6 (full model) |
| CAP-CMP-001 Competition Mgmt | /kompetisi | READY | None |
| CAP-CMP-002 Match Management | /kompetisi/$id | READY | None |
| CAP-CMP-003 Match Result | /kompetisi, /kompetisi/$id | READY | None |
| CAP-FIN-001 Financial Summary | /keuangan, / | READY | Q5 (taxonomy) |
| CAP-FIN-002 Transaction Mgmt | /keuangan, /keuangan/$id | READY | Q5 (taxonomy) |
| CAP-ANL-001 Operational Dashboard | / | READY | None |
| CAP-ANL-002 Performance Statistics | /, /pemain/$id, /tim | READY | None |

---

## Governance Dependency Summary

| Q # | Title | Routes Blocked | Impact | Status |
|---|---|---|---|---|
| Q1 | Football ID Authority | /pemain/$id (display semantics) | Format/issuer | IN_REVIEW |
| Q2 | Multi-tenancy Model | All (persistence) | Schema design | IN_REVIEW |
| Q3 | Authorization Model | All (access control) | RBAC implementation | IN_REVIEW |
| Q5 | Finance Taxonomy | /keuangan | Category semantics | IN_REVIEW |
| Q6 | Attendance Semantics | /latihan (full model) | Status meanings | IN_REVIEW |
| Q9 | Safeguarding | /pemain/$id (U-18 data) | Consent/access rules | IN_REVIEW |

**Blocking Implementation:** Q2, Q3 (all endpoints depend)  
**Non-Blocking Specification:** Q1, Q5, Q6, Q9 (contracts can be finalized with placeholders)

---

## Next Phase

1. Resolve Q2 (tenancy) and Q3 (auth) to unblock persistence design
2. Create OpenAPI specification (separate artifact)
3. Define repository interfaces
4. Implement backend in Supabase
