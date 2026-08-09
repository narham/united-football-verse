# Open Architecture Questions — bolaID Football OS

Dokumen ini mencatat keputusan arsitektur yang **belum terselesaikan** pada tahap Frontend Demo Mode. Setiap item memerlukan **keputusan eksplisit** sebelum backend / versi production diaktifkan.

> Protocol: Jangan tutup pertanyaan ini dengan asumsi. Ajukan ke Enterprise Architecture Council / stakeholder sebelum memutuskan.

---

## Q1. Football ID Semantics & Issuer Authority

**Konteks**: Spesifikasi menyatakan `football_id` adalah **identity reference yang stabil** — bukan sekadar nomor DB. Struktur target menghubungkan Person → Football Identity → Organization Membership.

**Pertanyaan yang Belum Terjawab**:
1. **Siapa issuer resmi Football ID?**
   - (a) bolaID Platform (centralized issuer)
   - (b) Federasi Sepak Bola Indonesia (PSSI / Asprov)
   - (c) Klub sendiri (self-issued, tapi cross-verifiable)
2. **Format apa yang dipakai?**
   - (a) Numerik incremental sederhana: `10000042`
   - (b) Structured: `BID-{YYYY}-{CLUBCODE}-{NNNN}`
   - (c) UUID v7 (time-sortable)
   - (d) DID-style: `did:bolaid:{checksummed-id}`
3. **Apakah Football ID = Player ID, atau Football ID bisa juga berlaku untuk Staff / Official / Referee / Organization?**

**Risiko jika diputuskan terlambat**: Komponen display `PlayerProfileCard` (sudah menampilkan Football ID) harus dirombak; migrasi DB `players.football_id` ke tabel terpisah tidak trivial.

---

## Q2. Multi-Tenancy & Club vs. Academy vs. SSB Distinction

**Konteks**: Target platform melayani **SSB, Football Academy, dan Club** — tiga bentuk organisasi berbeda dengan aturan operasional berbeda.

**Pertanyaan**:
1. Apakah tabel `clubs` mencakup ketiganya dengan `type: enum('ssb','academy','club')`, atau tiga tabel terpisah dengan inheritance?
2. **Multi-tenancy model**:
   - (a) `club_id` foreign key di semua tabel + RLS (shared schema, shared DB) — **saat ini db-schema.md mengikuti model ini**
   - (b) Schema per klub (private schema isolation)
   - (c) Database per klub (full isolation)
3. Bisakah satu organisasi bertindak sebagai SSB sekaligus Academy (misal SSB Garuda Muda punya program akademi)?

---

## Q3. Staff Role Model & Multi-Role User

**Konteks**: `db-schema.md` mendefinisikan enum `staff_role` dan `app_role` secara terpisah. User bisa punya role lintas konteks.

**Pertanyaan**:
1. Satu user = satu klub saja, atau bisa multi-staff di multi-klub (misal pelatih fisik freelance melayani 2 klub)?
2. Apa granularity permission minimum? (RBAC sederhana vs ABAC / relation-based)
3. Apakah pelatih boleh edit transaksi keuangan? Default RLS di db-schema.md mengasumsikan `owner_id = auth.uid()` → hanya owner. Ini terlalu ketat untuk real-world operational.

---

## Q4. Season Boundary Definition

**Konteks**: Semua statistik player (apps/goals/assists/minutes) di-scope per season. Demo data memakai `2025/2026` dan `2024/2025`.

**Pertanyaan**:
1. Kapan musim dimulai & berakhir secara resmi? (Kalender akademi vs liga SSB vs tahun kalender)
2. Apakah `player_stats` disimpan granular (per match) lalu di-aggregat, atau hanya aggregate per musim seperti demo model?
3. Bagaimana menangani pemain yang pindah klub di tengah musim? (stats partial per klub)

---

## Q5. Finance Classification & Category Taxonomy

**Konteks**: Demo data memakai kategori: SPP Bulanan, Sponsor, Sewa Lapangan, Seragam, Kompetisi, Konsumsi. Spesifikasi §14 merekomendasikan kategori baseline:
`SPP | Registration | Tournament | Equipment | Operational | Other`

**Pertanyaan**:
1. Apakah kategori diset **global (platform-level enum)** atau **per-klub customizable**?
2. Perlu `sub_category`? (e.g., Equipment → Jersey, Ball, Cone)
3. Pajak: apakah transaksi include tax, tax-exclusive, or mixed? (Saat ini flat `jumlah`).

---

## Q6. Attendance Model Semantics

**Konteks**: `db-schema.md` mendefinisikan `attendances` dengan `status text default 'hadir'`.

**Pertanyaan**:
1. Nilai status apa saja? Contoh: `hadir | sakit | izin | alpha | terlambat | dispensasi`
2. Apakah ada "make-up session" untuk pemain yang sakit? Attendance bisa dipindahkan ke sesi lain?
3. Attendance siapa yang mencatat? Pelatih? Manager? Auto-check-in via NFC / QR player card?

---

## Q7. Match Venue & Competition Ambiguity

**Konteks**: Demo `Match` memiliki:
```ts
{ competition: "Liga SSB Jaya 2026", lawan: "SSB Persada Junior", venue: "Kandang" | "Tandang", skorHome, skorAway }
```

**Pertanyaan**:
1. Jika venue "Netral" (stadion netral untuk final), bagaimana skor dicatat tetap benar antara "kita vs lawan"?
2. `skorHome` / `skorAway` bergantung venue. Perlu alias `our_score` / `opponent_score` untuk menghindari bug logic? (Demo data sudah memakai `isHome ? skorHome : skorAway` → perlu di-formalkan ke type-safety)
3. Competition model: liga vs turnamen (knockout) membutuhkan struktur standings berbeda. Apakah cukup `competitions.level`?

---

## Q8. Player Age Group / Age Category

**Konteks**: SSB biasanya beroperasi per kelompok usia (U-10, U-12, U-14, U-16, U-18, Senior). Demo data pemain umur 17–19 tahun (campuran).

**Pertanyaan**:
1. Apakah `players` punya `age_group` field, atau derived dari tgl_lahir + cutoff date?
2. Satu pemain di dua tim (U-16 sekaligus senior cadangan) — bagaimana roster modelnya?
3. Apakah training session di-organize per age group?

---

## Q9. Data Privacy & Safeguarding (Pemain Dibawah Umur)

**Konteks**: Mayoritas pemain SSB berusia <18 tahun — data pribadi mereka dilindungi undang-undang (UU PDP No. 27/2022 Jo. Peraturan Kominfo 20/2024).

**Pertanyaan**:
1. Siapa yang authorized melihat foto pemain U-17 ke luar konteks pelatih/manager klub? (RLS di `players.foto_url`)
2. Apakah perlu field `guardian_contact` (orang tua/wali) dengan protection lebih ketat lagi?
3. Audit trail: setiap akses ke data PII pemain harus dicatat?

---

## Q10. Frontend State Management Going Forward

**Konteks**: Spesifikasi §25 menyarankan jangan tambah library global state pada demo mode. Route state + React state sudah cukup.

**Pertanyaan**:
1. Saat backend aktif (Supabase + TanStack Query): apakah `@tanstack/react-query` cache cukup untuk global state, atau perlu Zustand/Jotai untuk UI state transien (mis. filter pemain yang tidak perlu sync ke server)?
2. Server state (TanStack Query) vs client state (UI-only): apakah ada boundary yang jelas untuk mencegah keduanya bercampur?

---

## Q11. Demo Data Persistence

**Konteks**: User bisa melakukan perubahan UI (edit nama klub di Pengaturan, dll.) — saat ini tidak disimpan.

**Pertanyaan**:
1. Untuk demo/presentasi: mau pakai `localStorage` persistence agar perubahan tidak hilang saat refresh? Atau tetap stateless (reset saat reload)?
2. Apakah ada "factory reset" button untuk kembali ke demo data awal?

---

## Q12. Notification System

**Konteks**: AppHeader di spesifikasi §6 menyebutkan `notification placeholder`. Saat ini belum ada.

**Pertanyaan**:
1. Notifikasi apa saja yang dibutuhkan tahap V1? (Jadwal latihan berubah, SPP jatuh tempo, Pertandingan baru dicatat, Cedera pemain dilaporkan)
2. Channel: in-app bell (Supabase Realtime) + Email + WhatsApp?
3. Subscription per role: pelatih hanya notif latihan, manager notif keuangan + jadwal?

---

## Tracking Log

| # | Pertanyaan | Dibuat | Status | Diputuskan Oleh | Keputusan |
|---|---|---|---|---|---|
| Q1 | Football ID Semantics | 2026-08-09 | 🔓 Open | — | — |
| Q2 | Multi-Tenancy Model | 2026-08-09 | 🔓 Open | — | — |
| Q3 | Staff Role Permission | 2026-08-09 | 🔓 Open | — | — |
| Q4 | Season Boundary | 2026-08-09 | 🔓 Open | — | — |
| Q5 | Finance Taxonomy | 2026-08-09 | 🔓 Open | — | — |
| Q6 | Attendance Semantics | 2026-08-09 | 🔓 Open | — | — |
| Q7 | Match/Competition Model | 2026-08-09 | 🔓 Open | — | — |
| Q8 | Age Group / Category | 2026-08-09 | 🔓 Open | — | — |
| Q9 | Safeguarding PII U-18 | 2026-08-09 | 🔓 Open | — | — |
| Q10 | Global State Strategy | 2026-08-09 | 🔓 Open | — | — |
| Q11 | Demo LocalStorage | 2026-08-09 | 🔓 Open | — | — |
| Q12 | Notification System | 2026-08-09 | 🔓 Open | — | — |
