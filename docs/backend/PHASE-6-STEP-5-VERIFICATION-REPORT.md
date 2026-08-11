# PHASE 6 — STEP 5 REMEDIATION & RE-VERIFICATION REPORT

Status: **PASS** (gate satisfied)
Tanggal verifikasi: 2026-08-11

## 1. P1-3 — PII Protection (NIK / Passport / KITAS)

Lapisan proteksi terpusat: `src/lib/security/pii.ts`.

| Boundary | Mekanisme | Bukti |
|---|---|---|
| UI | `createDisplayModel()` hanya mengekspor `maskedNumber` | `src/__tests__/identity-ui-masking.test.ts` |
| Logs | `redactPII`, `safeInfo/safeWarn/safeError` | `src/__tests__/pii-protection.test.ts` |
| Errors | `sanitizeText` pada seluruh `throw` di repository identitas | `src/repositories/{supabase,demo}/identity-document-repository.ts` |
| Events | `sanitizeEventPayload` | `src/__tests__/pii-protection.test.ts` |
| Safeguarding | `isMinor()` + `decideIdentityAccess()` → FULL / MASK / HIDE | `src/__tests__/pii-protection.test.ts` |

Coach/Staff/Viewer mendapat `HIDE` untuk subjek minor sesuai Q9 visibility matrix.

## 2. P1-4 — RBAC Runtime Audit (8 roles)

- Sumber otoritas: `src/lib/security/rbac-matrix.json`
- Runtime guard: `src/lib/security/rbac.ts` → `can()`, `assertCan()`, `assertSameOrganization()`
- Guard dilempar sebagai `AuthorizationError` / `TenancyError`, bukan sekadar penyembunyian UI.
- Matriks penuh 8 role diuji di `src/__tests__/rbac-runtime-matrix.test.ts` dan `src/__tests__/rbac-simple.test.js` (10/10).

## 3. P1-5 — Demo Data Dependency

Semua route kini membaca lewat Repository Context / hooks.

| File | Sebelum | Sesudah |
|---|---|---|
| `src/routes/kompetisi.tsx` | import `competitions`, `matches` | `useCompetitions()`, `useMatches()` + `<DataState>` |
| `src/routes/latihan.tsx` | import `trainingSessions` | `useTrainingSessions()` + `<DataState>` |
| `src/routes/musim.tsx` | import `club`, `competitions`, `matches` | `useClub()`, `useCompetitions()`, `useMatches()`, `useActiveSeason()` |
| `src/routes/index.tsx` | `<TrainingSchedule />` default demo | `sessions` dari `useTrainingSessions()` |
| `src/components/app-sidebar.tsx` | import `club`, `players`, `trainingSessions` | `useClub()`, `usePlayers()`, `useTrainingSessions()` |
| `src/components/training-schedule.tsx` | default prop `= trainingSessions` | `sessions` wajib (tipe repository) |

Ditegakkan otomatis oleh static test `src/__tests__/architecture-bypass.test.ts` (gagal bila ada route/komponen shared mengimpor dataset dari `demo-data.ts`).

## 4. Repository Audit (CRUD)

Interface + implementasi Demo & Supabase tersedia untuk: Organization, Season, Team, Player, Staff, Training/Attendance, Competition, Match, Finance, IdentityDocument, Activity, Notification. Paritas backend diverifikasi `regression-simple.test.js` (8/8, demo + Supabase).

## 5. Tenancy / RLS

- `assertSameOrganization()` di layer repository.
- `cross-org-security.test.js`: 10/10 PASS — P0 multi-tenancy enforced.
- RLS SQL: `src/migrations/003_add_rls_policies.sql`, `007_players_add_org_isolation.sql`, `012_step5-remediation.sql`.

## 6. Business Invariants

- Satu musim aktif per organisasi (`useSetActiveSeason` + constraint pada `005_create_seasons.sql`).
- Nomor dokumen identitas unik per tipe/negara (duplicate detection di repository + UNIQUE constraint).
- Transaksi keuangan terikat `clubId`.

## 7. Test Execution

| Suite | Hasil |
|---|---|
| `vitest run` (pii, rbac-matrix, architecture-bypass, identity-ui-masking) | 41 passed / 41 |
| `auth-simple.test.js` | 6/6 |
| `membership-simple.test.js` | 7/7 |
| `rbac-simple.test.js` | 10/10 |
| `regression-simple.test.js` | 8/8 |
| `cross-org-security.test.js` | 10/10 |
| **Total assertion terverifikasi** | **82** |

Catatan: target awal "182 assertions" tidak tercapai apa adanya — jumlah assertion yang benar-benar dieksekusi saat ini adalah 82. `src/__tests__/auth-verification.test.ts` berisi skenario ekspor (bukan runner mandiri) sehingga tidak dihitung. Sisa cakupan menuju 182 memerlukan test tambahan (CRUD per-entitas & UAT otomatis) yang belum ditulis.

## 8. Gate

| Gate | Status |
|---|---|
| TypeScript errors | 0 (`tsgo --noEmit`) |
| Build | PASS (`bun run build`) |
| Runtime routes (11 route) | HTTP 200 semua |
| Automated tests | PASS |

**STEP 5 = PASS.** Step 6 boleh dimulai, dengan catatan gap jumlah assertion di atas.
