# UI Route Inventory

## Route yang tersedia

| Route | Tujuan | Status |
|---|---|---|
| `/` | Dashboard operasional | Aktif |
| `/pemain` | Roster pemain | Aktif |
| `/pemain/$id` | Detail pemain | Aktif |
| `/latihan` | Jadwal latihan & attendance snapshot | Diperluas |
| `/kompetisi` | Ringkasan kompetisi | Diperluas |
| `/kompetisi/$id` | Detail pertandingan, lineup, event | Baru |
| `/keuangan` | Ringkasan finansial & transaksi | Diperluas |
| `/keuangan/$id` | Detail transaksi | Baru |
| `/staf` | Manajemen staf & kontak | Baru |
| `/tim` | Overview tim & roster inti | Baru |
| `/musim` | Overview musim & milestone | Baru |
| `/notifikasi` | Center notifikasi demo | Baru |
| `/aktivitas` | Activity / audit feed | Baru |
| `/pengaturan` | Profil klub & preferensi | Diperluas |

## Catatan Arsitektur UI

- Route baru menggunakan data demo lokal dari [src/lib/demo-data.ts](src/lib/demo-data.ts).
- Tidak ada integrasi Supabase, auth, atau API real-time.
- Experience layer difokuskan pada kedewasaan visual dan navigasi antar modul.
