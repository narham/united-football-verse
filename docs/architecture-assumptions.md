# Architecture Assumptions & Temporary MVP Simplifications

Dokumen ini mencatat **asumsi arsitektur** dan **simplifikasi sementara** yang diambil selama tahap Frontend Demo Mode Football OS v1. Setiap item di sini berfungsi sebagai:
- audit trail keputusan simplifikasi
- daftar pekerjaan yang harus di-address pada tahap backend / skala nasional
- input untuk ADR (Architecture Decision Record) di masa depan

---

## A. Temporary MVP Simplifications

### A.1. `player.clubId` ≠ Permanent Ownership (Simplifikasi Kepemilikan)

**Status**: ⚠️ TEMPORARY — AKAN DIUBAH SAAT FOOTBALL ID DAN MULTI-CLUB MEMBERSHIP DIAKTIFKAN

**Konteks MVP saat ini**:
```ts
// demo-data.ts: struktur Player sederhana
player: { id, clubId: "club-garuda", ... }
```
Satu pemain diasumsikan memiliki `clubId` tunggal yang menunjuk ke klub pemilik saat ini. Ini memudahkan filter roster per-klub di UI.

**Arsitektur target (mendatang)**:
```
Person  (real-world human, root)
  │
  ▼
Football Identity  (stable reference, immutable football_id)
  │
  ▼
Organization Membership  (time-boxed, per-periode)
  ├── Club A (2024/2025)
  ├── Club B (2025/2027)  ← current
  └── Academy C (future loan)
```

**Konsekuensi & To-Do**:
- [ ] Saat backend aktif: tambahkan tabel `football_identities`, `person`, `organization_memberships`
- [ ] `player.club_id` di tabel `players` menjadi reference ke membership **aktif** saja (cached)
- [ ] UI `PlayerProfileCard` harus bisa menampilkan riwayat kepindahan klub
- [ ] `football_id` TIDAK BOLEH berubah ketika pemain pindah klub (field harus stable)

---

### A.2. Data Demo Tidak Melalui Repository Abstraction Layer

**Status**: ⚠️ TEMPORARY — SUDAH DIRANCANG UNTUK DITUKAR KE REPOSITORY PATTERN

**Konteks MVP saat ini**:
```tsx
// Di page / component: import langsung dari demo-data
import { players, matches } from "@/lib/demo-data";
```

**Arsitektur target (mendatang)**:
```ts
// UI (tidak berubah banyak, hanya ganti import source)
import { playerRepository } from "@/data/repositories/player";

// Application Boundary
interface PlayerRepository {
  list(clubId: string): Promise<Player[]>;
  byId(id: string): Promise<Player | undefined>;
  stats(playerId: string, season: string): Promise<PlayerStats>;
}
// Dua implementasi: DemoPlayerRepository ↔ SupabasePlayerRepository
```

**Konsekuensi**:
- Demo data functions saat ini (`playerById`, `financeTotals`, dll.) **harus tetap pure-function-style** agar mudah di-wrap sebagai repository method
- Jangan tambahkan stateful logic / side-effect di dalam `demo-data.ts`

---

### A.3. Autentikasi & Otorisasi: Single-Club, Single-User Demo

**Status**: ⚠️ TEMPORARY — SUPABASE AUTH AKAN MENGGANTI

**Konteks MVP saat ini**:
- Tidak ada login. Semua user diasumsikan sebagai `owner` dari satu klub: **SSB Garuda Muda** (id: `club-garuda`)
- Semua data klub ini langsung ter-expose tanpa scope `auth.uid()`
- `AppHeader` tidak menampilkan profile user autentik

**Arsitektur target (mendatang)**:
- `auth.users` (Supabase Auth) → `user_roles` (admin/pelatih/manager/pemain)
- RLS per-klub: `club.owner_id = auth.uid()` → `has_role(user, 'pelatih')`
- Multi-klub per user: switcher header akan memuat list klub berdasarkan membership

---

### A.4. Attendance: UI Placeholder Tanpa Backing Data

**Status**: ⚠️ TEMPORARY — ATTENDANCE MODEL ADA DI db-schema.md TAPI TIDAK ADA DATA DEMO

**Konteks**:
- Komponen `TrainingSchedule` dan route `/latihan` menampilkan sesi latihan
- Tabel `attendances` sudah didefinisikan di `docs/db-schema.md`
- Demo data tidak membuat catatan attendance per pemain per sesi (jumlahnya besar: 20 pemain × 4 sesi/minggu × 12 minggu = ~960 record)
- UI button/column attendance ada tapi non-fungsional

**To-Do backend**:
- Aktifkan trigger Supabase yang otomatis buat attendance row setiap pertemuan latihan
- Tambah shortcut "Isi Semua Hadir" untuk pelatih

---

### A.5. Competition: Match = Flat Record, Belum Ada Lineup/Event

**Status**: ⚠️ TEMPORARY SIMPLIFICATION

**Konteks MVP saat ini**:
```ts
type Match = { id, competition, lawan, tanggal, skorHome, skorAway, venue };
```
Belum ada: lineup, substitution, cards, goals per player, assists, minute-by-minute events.

**Arsitektur target**:
```
matches
  ├── match_lineups (match_id, player_id, position, minutes_played)
  ├── match_events  (goal, assist, card, sub, minute)
  └── competition_standings (derived)
```

---

### A.6. Finance: Tanpa Invoice, Payment Gateway, atau Double-Entry

**Status**: ⚠️ TEMPORARY SIMPLIFICATION

**Konteks MVP saat ini**:
- `transactions` adalah flat ledger: `tipe: "masuk" | "keluar"` + `jumlah`
- Belum ada chart of accounts, journal entries (debit/kredit berpasangan), atau invoice tracking
- Tidak ada integrasi payment gateway (SPP dibayar off-book)

**Arsitektur target**:
- Double-entry bookkeeping dengan `accounts` + `journal_entries`
- Invoice (untuk SPP per pemain) + `payments`
- Rekonsiliasi bank / e-wallet

---

### A.7. Football ID: Dummy Value tanpa Verifikasi Issuer

**Status**: ⚠️ TEMPORARY SIMPLIFICATION

**Konteks MVP saat ini**:
- `football_id` di demo data menggunakan format string dummy (contoh: `BID-2008-GRD-0001`)
- Tidak ada issuer authority, tidak ada signature, tidak ada verifikasi
- Football ID diasumsikan unik per pemain tapi tidak diverifikasi silang dengan modul Football ID terpisah

**Arsitektur target (saat Football ID module aktif)**:
- Football ID sebagai stable DID-style identifier
- Verifikasi: `football_identities` table dengan issuer, revoked_at, proof
- Cross-reference dengan National Football Federation databases

---

## B. Scope Boundaries (Apa yang *Tidak* Ditangani Tahap Ini)

| Area | Status | Catatan |
|---|---|---|
| Mobile-native apps (React Native) | **Out of scope** | Future track terpisah |
| Real-time match updates | Out of scope | Supabase Realtime + Channels pada tahap backend |
| Registration / onboarding pemain baru | Out of scope | Form submit-only tanpa backend persist |
| Public API integrasi (Transfermarkt, dll.) | Out of scope | Football Intelligence module |
| League standings / bracket | Out of scope | Competition Platform module |
| Photo / document upload (Storage) | Out of scope | Supabase Storage tahap backend |
| Email / WhatsApp notification | Out of scope | Edge Functions + 3rd party |
| Analytics dashboard deep-dive (drill-down) | Limited | CAP-ANL-002 basic only |

---

## C. Performance Assumptions

- Demo data size: ≤ 50 pemain, ≤ 20 pertandingan, ≤ 50 transaksi
- Tanpa pagination / infinite scroll di table
- Tanpa virtualization (jumlah record kecil, DOM bisa handle)
- **Saat scale**: Perlu tambahkan React Query pagination + table virtualization

---

## D. Assumptions Keselamatan & Safeguarding

| Area | Risiko | Mitigasi |
|---|---|---|
| Data pemain minor (usia <18) | 🟡 Risiko PII (Personal Identifiable Information) | Demo data **fiktif**; backend akan ada RLS + audit log untuk akses data pemain |
| Football ID dipakai sebagai identitas resmi | 🟡 Risiko reputasi jika ID bocor/reuse | Tahap ini DISEBUTKAN SECARA JELAS sebagai "Football OS — Frontend Demo Mode" |
| Finance tanpa otorisasi | 🟡 Risiko salah-edit transaksi | Pengaturan → System menampilkan "Frontend Demo Mode"; button save tanpa backend persist |

---

## E. UI/UX Assumptions

- **Dark mode default**: mengikuti `@custom-variant dark (&:is(.dark *))`; toggle pengaturan akan tersedia di Pengaturan → Interface
- **Bahasa UI**: Indonesia (`id-ID`) untuk semua copy; lokalisasi English untuk v2
- **Typography**: Bebas Neue di-load dari Google Fonts (fallback: system-ui sans-serif jika network offline)
- **Responsive breakpoint**: Tailwind defaults (`sm` 640px, `md` 768px, `lg` 1024px)
