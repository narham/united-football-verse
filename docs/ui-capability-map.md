# UI → Capability Map — bolaID Football OS

Dokumen ini memetakan setiap layar UI Football OS v1 ke:
- **Capability ID** (sumber kebenaran: Enterprise Capability Baseline v1.0)
- **Bounded Context** (Domain-Driven Design)
- **User Role** yang berinteraksi
- **Future Backend Dependency** saat Supabase diaktifkan

---

## Legenda Capability ID Baseline

| ID | Nama Capability |
|---|---|
| CAP-ORG-001 | Organization Profile |
| CAP-ORG-002 | Organization Configuration |
| CAP-ORG-003 | Staff Management |
| CAP-ORG-004 | Team Management |
| CAP-ID-001 | Player Profile |
| CAP-ID-002 | Football Identity Reference |
| CAP-ID-003 | Player Membership |
| CAP-TRN-001 | Training Schedule |
| CAP-TRN-002 | Training Session Management |
| CAP-TRN-003 | Attendance |
| CAP-CMP-001 | Competition Management |
| CAP-CMP-002 | Match Management |
| CAP-CMP-003 | Match Result |
| CAP-FIN-001 | Financial Summary |
| CAP-FIN-002 | Transaction Management |
| CAP-ANL-001 | Operational Dashboard |
| CAP-ANL-002 | Basic Performance Statistics |

---

## 1. Dashboard (`/`)

| Field | Nilai |
|---|---|
| **Route** | `/` (index) |
| **UI File** | `src/routes/index.tsx` |
| **Capability** | **CAP-ANL-001** Operational Dashboard |
| **Secondary** | CAP-ANL-002 Basic Performance Statistics |
| **Bounded Context** | `Analytics` → `Organization` → `Competition` → `Training` → `Finance` |
| **User Role** | Admin, Pelatih, Manager, Pemain (read-only subset) |
| **Backend Dep (Future)** | `clubs`, `players`, `player_stats`, `matches`, `training_sessions`, `transactions` |

### Sub-section Mapping
| UI Section | Capability | Context |
|---|---|---|
| KPI: Total Pemain | CAP-ORG-004 | Organization / Team |
| KPI: Latihan Minggu Ini | CAP-TRN-001 | Training |
| KPI: Rekam Pertandingan | CAP-CMP-003 | Competition |
| KPI: Saldo Klub | CAP-FIN-001 | Finance |
| Upcoming Training | CAP-TRN-001, CAP-TRN-002 | Training |
| Latest Matches | CAP-CMP-002, CAP-CMP-003 | Competition |
| Player Roster Snapshot | CAP-ORG-004, CAP-ANL-002 | Team / Analytics |
| Finance Summary | CAP-FIN-001 | Finance |

---

## 2. Pemain (`/pemain`)

| Field | Nilai |
|---|---|
| **Route** | `/pemain` |
| **UI File** | `src/routes/pemain.tsx` |
| **Capability** | **CAP-ORG-004** Team Management |
| **Secondary** | CAP-ID-001 Player Profile, CAP-ID-003 Player Membership |
| **Bounded Context** | `Identity` → `Organization` |
| **User Role** | Admin, Pelatih, Manager |
| **Backend Dep (Future)** | `players` (filter posisi/status/search via Supabase RPC/Query), `clubs`, `football_identity` (future) |

### Sub-section Mapping
| UI Section | Capability |
|---|---|
| Search nama pemain | CAP-ORG-004 |
| Filter posisi (GK/DF/MF/FW) | CAP-ORG-004 |
| Filter status (aktif/cedera/cadangan/nonaktif) | CAP-ORG-004 |
| PlayerTable / PlayerRow | CAP-ORG-004, CAP-ID-001 |
| Empty state (tidak ada pemain) | CAP-ORG-004 |

---

## 3. Detail Pemain (`/pemain/$id`)

| Field | Nilai |
|---|---|
| **Route** | `/pemain/$id` |
| **UI File** | `src/routes/pemain.$id.tsx` |
| **Capability** | **CAP-ID-001** Player Profile |
| **Secondary** | CAP-ID-002 Football Identity Reference, CAP-ANL-002 Basic Performance Statistics, CAP-TRN-001 Training Schedule, CAP-CMP-003 Match Result |
| **Bounded Context** | `Identity` → `Analytics` → `Training` → `Competition` |
| **User Role** | Admin, Pelatih, Manager, Pemain (profil sendiri) |
| **Backend Dep (Future)** | `players`, `player_stats`, `football_identity` (future), `attendances`, `matches` (lineup/substitution future) |

### Sub-section Mapping
| UI Section | Capability |
|---|---|
| PlayerProfileCard (nama, foto, #nomor, posisi, Football ID, DOB, status) | CAP-ID-001, CAP-ID-002 |
| Statistik appearances/goals/assists/minutes | CAP-ANL-002 |
| Performance Summary (derived: rating, form) | CAP-ANL-002 |
| Season Statistics table | CAP-ANL-002 |
| Recent Activity / Training & Competition history | CAP-TRN-003, CAP-CMP-003 |
| Empty state (data tidak tersedia) | CAP-ID-001 |

---

## 4. Latihan (`/latihan`)

| Field | Nilai |
|---|---|
| **Route** | `/latihan` |
| **UI File** | `src/routes/latihan.tsx` |
| **Capability** | **CAP-TRN-001** Training Schedule |
| **Secondary** | CAP-TRN-002 Training Session Management, CAP-TRN-003 Attendance (UI placeholder) |
| **Bounded Context** | `Training` → `Organization` |
| **User Role** | Admin, Pelatih, Manager, Pemain (read schedule) |
| **Backend Dep (Future)** | `training_sessions`, `attendances`, `clubs` |

### Sub-section Mapping
| UI Section | Capability |
|---|---|
| Weekly Schedule (TrainingSchedule component) | CAP-TRN-001 |
| Date/Time/Location/Title/Fokus | CAP-TRN-002 |
| Attendance placeholder (future) | CAP-TRN-003 |
| Filter simple (date range / hari) | CAP-TRN-001 |

---

## 5. Kompetisi (`/kompetisi`)

| Field | Nilai |
|---|---|
| **Route** | `/kompetisi` |
| **UI File** | `src/routes/kompetisi.tsx` |
| **Capability** | **CAP-CMP-001** Competition Management |
| **Secondary** | CAP-CMP-002 Match Management, CAP-CMP-003 Match Result |
| **Bounded Context** | `Competition` → `Organization` |
| **User Role** | Admin, Pelatih, Manager, Pemain (read-only) |
| **Backend Dep (Future)** | `competitions`, `matches`, `competition_seasons` (future), `standings` (future) |

### Sub-section Mapping
| UI Section | Capability |
|---|---|
| Competition / Season / Level summary | CAP-CMP-001 |
| W/D/L record + Gol:Bobol | CAP-CMP-003 |
| Match history (MatchResultCard) | CAP-CMP-002, CAP-CMP-003 |
| Upcoming matches (status UPCOMING) | CAP-CMP-002 |
| Result badge (WIN/DRAW/LOSS) | CAP-CMP-003 |

---

## 6. Keuangan (`/keuangan`)

| Field | Nilai |
|---|---|
| **Route** | `/keuangan` |
| **UI File** | `src/routes/keuangan.tsx` |
| **Capability** | **CAP-FIN-001** Financial Summary |
| **Secondary** | CAP-FIN-002 Transaction Management |
| **Bounded Context** | `Finance` → `Organization` |
| **User Role** | Admin, Manager |
| **Backend Dep (Future)** | `transactions`, `clubs`, `invoice` (future), `payment` (future) |

### Sub-section Mapping
| UI Section | Capability |
|---|---|
| Balance / Total Income / Total Expense (FinanceSummary) | CAP-FIN-001 |
| Transaction list (kategori: SPP, Registration, Tournament, Equipment, Operational, Other) | CAP-FIN-002 |
| Category filter (future) | CAP-FIN-002 |

---

## 7. Pengaturan (`/pengaturan`)

| Field | Nilai |
|---|---|
| **Route** | `/pengaturan` |
| **UI File** | `src/routes/pengaturan.tsx` |
| **Capability** | **CAP-ORG-001** Organization Profile + **CAP-ORG-002** Organization Configuration |
| **Bounded Context** | `Organization` → `Identity` (preferences) |
| **User Role** | Admin, Manager |
| **Backend Dep (Future)** | `clubs`, `club_preferences` (future), `user_preferences` (future), `auth.users` (theme per-user) |

### Sub-section Mapping
| UI Section | Capability |
|---|---|
| Club Profile (nama, logo, kota, tahun berdiri, sport) | CAP-ORG-001 |
| Interface (dark/light mode toggle, basic preferences) | CAP-ORG-002 |
| System Info (bolaID version, Football OS, frontend demo mode) | CAP-ORG-002 (read-only) |

---

## Data Flow Abstraction (Future Backend Boundary)

```
UI Layer (routes + presentational components)
        │
        ▼
Application / Data Access Boundary (future: repository pattern)
        │
        ├─ Current: src/lib/demo-data.ts  ← Demo Repository (browser-only)
        │
        └─ Future: Supabase Repository
                │
                ├─ supabase-js client
                ├─ RLS policy-scoped queries
                └─ PostgreSQL → clubs / players / matches / transactions / ...
```

---

## Traceability Matrix Ringkas

| Route | Primary Capability | Bounded Context | Backend Table |
|---|---|---|---|
| `/` | CAP-ANL-001 | Analytics | clubs, players, matches, transactions, training_sessions |
| `/pemain` | CAP-ORG-004 | Organization / Team | players |
| `/pemain/$id` | CAP-ID-001 | Identity | players, player_stats, attendances |
| `/latihan` | CAP-TRN-001 | Training | training_sessions, attendances |
| `/kompetisi` | CAP-CMP-001 | Competition | competitions, matches |
| `/keuangan` | CAP-FIN-001 | Finance | transactions |
| `/pengaturan` | CAP-ORG-001 | Organization | clubs, preferences |
