# Architecture Risk Register — Football OS

| Risk ID | Description | Probability | Impact | Severity | Affected Context | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| R-001 | Identity duplication or conflicting football identity records | Medium | High | High | Identity | Require a single authoritative identity lifecycle and issuer governance | Architecture Governance | Open |
| R-002 | Cross-tenant data leakage between organizations | Medium | High | High | Organization / Tenancy | Enforce organization scope and membership-based RLS controls | Security Architecture | Open |
| R-003 | Authorization bypass through over-broad role assignment | Medium | High | High | Authorization | Require explicit scope checks for team, competition, finance, and minors | Security Architecture | Open |
| R-004 | Minor-data exposure to unauthorized staff or guardians | Medium | High | High | Safeguarding | Apply purpose-based consent, minimization, and audit logging | Privacy Architecture | Open |
| R-005 | Incorrect season statistics due to ambiguous season lifecycle | Medium | Medium | Medium | Season / Analytics | Define season boundaries and participation windows explicitly | Domain Architecture | Open |
| R-006 | Incorrect match result semantics due to lifecycle ambiguity | Low | Medium | Medium | Competition | Use canonical match states and invariant rules | Domain Architecture | Open |
| R-007 | Financial inconsistency from flat transaction modeling | Medium | Medium | Medium | Finance | Separate ledger, invoice, payment, and accounting concepts | Finance Architecture | Open |
| R-008 | Notification privacy leakage through broad delivery | Low | Medium | Medium | Communication | Restrict notification content by role and consent | Product Architecture | Open |
| R-009 | Future migration complexity from MVP-only data model | High | Medium | High | Data Architecture | Preserve MVP as legacy and isolate it from enterprise model | Data Architecture | Open |
