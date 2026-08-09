# Rencana: bolaID — Football OS (Dashboard Manajemen SSB/Klub)

## Tujuan

Membangun modul pertama ekosistem **bolaID**: **Football OS** — dashboard manajemen Sekolah Sepak Bola / Klub yang mencakup pemain, latihan, kompetisi, dan keuangan. Tahap ini fokus pada UI berfungsi penuh dengan **data demo** di frontend, ditambah **rancangan skema database** sebagai dokumen arsitektur (belum mengaktifkan Lovable Cloud).

## Catatan teknologi

- Proyek ini berjalan di **TanStack Start** (React 19 + Vite + SSR), bukan Next.js. Kemampuan SSR/SSG & server functions setara dengan kebutuhan Next.js Anda; nama framework berbeda tapi fungsionalitas terpenuhi.
- Tailwind CSS v4 + shadcn/ui sudah tersedia.
- Backend (Supabase/Lovable Cloud) **belum diaktifkan** sesuai pilihan Anda. Data demo dipakai untuk UI; skema DB dirancang sebagai dokumen.

## Sistem desain — Sporty & Energik

Palet dan tipografi bertema sepak bola: hijau lapangan sebagai primary, aksen elektrik (lime/cyan) untuk energi, tipografi tegas atletik.

- **Tipografi**: `bebas-neue-barlow` — Bebas Neue (heading, tinggi & tegas, nuansa jersey/skor) + Barlow (body, terbaca, sporty).
- **Warna primary**: hijau lapangan oklch (mis. `oklch(0.45 0.13 145)`), aksen lime elektrik untuk CTA/statistik.
- **Token** ditambahkan ke `src/styles.css` (`:root` + `.dark`): `--field`, `--field-foreground`, `--energetic`, `--energetic-foreground`, plus token status (win/draw/loss, aktif/cadangan).
- **Nuansa**: kartu dengan sudut tegas, badge posisi pemain (GK/DF/MF/FW), indikator performa, animasi hover ringan. Dark mode didukung.
- Font dimuat via `<link>` di `src/routes/__root.tsx` head; didefinisikan di `@theme` `src/styles.css`.

## Arsitektur rute

Halaman pertama yang diminta adalah Football OS, jadi `/` = dashboard.

```
src/routes/
  __root.tsx            -> layout: sidebar nav bolaID + header klub + <Outlet/>
  index.tsx             -> / Dashboard (ringkasan: statistik, latihan terdekat, hasil pertandingan, roster singkat)
  pemain.tsx            -> /pemain Daftar pemain (tabel + filter posisi/status)
  pemain.$id.tsx        -> /pemain/$id Detail pemain (profil, statistik, riwayat)
  latihan.tsx           -> /latihan Jadwal & sesi latihan
  kompetisi.tsx         -> /kompetisi Kompetisi & hasil pertandingan
  keuangan.tsx          -> /keuangan Keuangan klub (SPP, transaksi)
  pengaturan.tsx        -> /pengaturan Profil klub & pengaturan
```

Setiap rute punya `head()` sendiri (title, description, og).

## Komponen UI utama

- `AppSidebar` — navigasi: Dashboard, Pemain, Latihan, Kompetisi, Keuangan, Pengaturan + badge klub.
- `AppHeader` — nama klub, ganti klub, profil.
- `StatCard` — kartu statistik (jumlah pemain, latihan minggu ini, menang/belum, saldo).
- `PlayerTable` / `PlayerRow` — roster dengan badge posisi & status.
- `PlayerProfileCard` — kartu profil pemain + statistik musim.
- `TrainingSchedule` — jadwal latihan mingguan.
- `MatchResultCard` — hasil pertandingan terbaru.
- `FinanceSummary` — ringkasan pemasukan/pengeluaran.
- Komponen shadcn yang ada (Button, Card, Badge, Table, dll.) dipakai & dikustom sesuai token.

## Data demo

- `src/lib/demo-data.ts` — modul browser-safe berisi klub contoh ("SSB Garuda Muda"), daftar pemain (±20), latihan, pertandingan, transaksi. Dipakai langsung oleh komponen (bukan via loader/Query karena belum ada backend).
- Cukup untuk menampilkan semua halaman berfungsi: tabel, filter, detail, jadwal.

## Rancangan skema database (dokumen, bukan migrasi aktif)

Disusun sebagai `docs/db-schema.md` (atau blok di plan) — siap dijalankan saat Lovable Cloud diaktifkan. Cakupan minimal:

```text
clubs                — id, nama, logo_url, kota, founded_year, sport (enum)
players              — id, club_id FK, football_id, nama, posisi (enum), nomor_punggung, tgl_lahir, status, foto_url
player_stats         — id, player_id FK, season, apps, goals, assists, minutes
staff                — id, club_id FK, nama, role (enum), user_id?
training_sessions    — id, club_id FK, title, day_of_week, start_time, end_time, location
attendances          — id, training_id FK, player_id FK, status (enum), date
competitions         — id, nama, season, level (enum)
matches              — id, club_id FK, competition_id FK, opponent, date, home_score, away_score, venue (enum)
transactions         — id, club_id FK, type (enum), amount, category, date, note
```

Plus enum, RLS policy per-klub (`club_id = auth`-scoped via pemilik), dan grant block mengikuti aturan Lovable Cloud. Tidak dieksekusi sekarang — disimpan sebagai spesifikasi.

## Langkah pengerjaan

1. Token desain sporty + font (styles.css + __root head).
2. `__root.tsx`: layout dengan sidebar + header bolaID.
3. `src/lib/demo-data.ts` + tipe data.
4. Komponen UI (StatCard, PlayerTable, dll.).
5. Rute: index (dashboard) → pemain → pemain.$id → latihan → kompetisi → keuangan → pengaturan, masing-masing dengan head().
6. Hapus placeholder di index.tsx.
7. Verifikasi build + preview.

## Di luar ruang lingkup tahap ini

- Aktivasi Lovable Cloud / koneksi DB nyata / autentikasi.
- Modul lain (Football ID, Competition Platform, Development Engine, Football Intelligence) — tahap berikutnya.
- Aplikasi mobile (React Native) — terpisah.
