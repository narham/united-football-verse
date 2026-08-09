# Domain Events — Football OS

## Event Catalog

| Event | Producer Context | Trigger | Payload Concept | Consumers | Sensitivity | Audit |
|---|---|---|---|---|---|---|
| FootballIdentityIssued | Identity | Football ID creation | footballIdentityId, personId, issuer | Organization, Competition | High | Required |
| FootballIdentityVerified | Identity | Verification success | footballIdentityId, verifier | Organization, Safeguarding | High | Required |
| PersonRegistered | Identity | Person created | personId, source | Organization, Consent | Medium | Required |
| GuardianLinked | Identity | Guardian relationship created | personId, guardianId, relationship | Safeguarding, Training | High | Required |
| ConsentGranted | Identity | Consent recorded | subjectId, purpose, scope | Safeguarding, Governance | High | Required |
| ConsentRevoked | Identity | Consent withdrawn | subjectId, purpose | Safeguarding, Governance | High | Required |
| MembershipCreated | Organization | Membership created | organizationId, personId | Authorization, Team | Medium | Required |
| MembershipActivated | Organization | Membership activated | membershipId | Authorization, Team | Medium | Required |
| MembershipTransferred | Organization | Membership moved | membershipId, fromOrg, toOrg | Authorization, Analytics | Medium | Required |
| MembershipEnded | Organization | Membership ended | membershipId | Authorization, Analytics | Medium | Required |
| TeamCreated | Organization | Team created | teamId, organizationId | Training, Competition | Low | Recommended |
| PlayerAssignedToTeam | Organization | Team assignment | playerId, teamId | Training, Competition | Medium | Required |
| TrainingSessionCreated | Training | Session scheduled | trainingSessionId, organizationId | Attendance, Notifications | Medium | Recommended |
| AttendanceRecorded | Training | Attendance captured | attendanceId, playerId, sessionId | Coaching, Guardian | Medium | Required |
| CompetitionCreated | Competition | Competition defined | competitionId, seasonId | Match, Registration | Medium | Recommended |
| CompetitionRegistrationCreated | Competition | Registration submitted | registrationId, playerId | Competition, Finance | Medium | Required |
| MatchScheduled | Competition | Match created | matchId, competitionId | Analytics, Notifications | Medium | Recommended |
| MatchCompleted | Competition | Match finalized | matchId, result | Analytics, Finance | Medium | Required |
| MatchPostponed | Competition | Match deferred | matchId, reason | Analytics, Notifications | Medium | Recommended |
| AssessmentRecorded | Analytics | Assessment stored | assessmentId, playerId | Coaching, Safeguarding | High | Required |
| InvoiceIssued | Finance | Invoice created | invoiceId, organizationId | Finance, Notifications | High | Required |
| PaymentRecorded | Finance | Payment posted | paymentId, invoiceId | Finance, Audit | High | Required |
| NotificationRequested | Communication | Message requested | notificationId, recipient | Notifications | Medium | Required |
| NotificationDelivered | Communication | Delivery completed | notificationId, channel | Notifications | Medium | Recommended |
