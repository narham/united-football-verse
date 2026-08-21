# Rencana: Implementasi UI/UX bolaID Football OS

Arah visual dipertahankan dan dipertajam: Bebas Neue + Barlow, hijau lapangan sebagai primary, aksen lime elektrik. Semua pekerjaan bersifat frontend/presentasi — tanpa perubahan repository, backend, atau logika bisnis.

## 1. Polish visual global

- Rapikan skala tipografi (display/heading/body/caption) dan spacing section agar konsisten di seluruh route.
- Standarkan kartu: radius, border, shadow hover, dan padding lewat token di `src/styles.css`.
- Satukan gaya badge (posisi, status pemain, hasil W/D/L) dan chip filter.
- Cek kontras light & dark mode untuk token `--field`, `--energetic`, `--win`, `--loss`.
- Tambah state fokus keyboard yang jelas pada elemen interaktif.

## 2. Responsif penuh

- Terapkan pola grid dua kolom untuk baris header (judul + aksi): `grid-cols-[minmax(0,1fr)_auto]` di mobile, `flex` mulai `sm:`, dengan `min-w-0` + `truncate`.
- Tabel roster/transaksi: tampilan kartu bertumpuk di mobile, tabel penuh di `md:` ke atas.
- Sidebar: drawer di mobile, collapsible icon di desktop; bottom-safe padding untuk konten.
- Stat card grid: 1 kolom → 2 → 4 mengikuti breakpoint.

## 3. Dashboard & Pemain

- Dashboard (`/`): hirarki ulang menjadi baris KPI, panel "Latihan terdekat", "Hasil terakhir", dan ringkasan keuangan; tiap panel punya empty state sendiri.
- Roster (`/pemain`): toolbar pencarian + filter posisi/status yang lengket di atas, hitung hasil, dan skeleton saat memuat.
- Profil pemain (`/pemain/$id`): header pemain yang ringkas dan responsif, ringkasan performa, tab histori dengan tab scrollable di mobile.

## 4. Latihan, Kompetisi, Keuangan

- Latihan: jadwal mingguan dengan penanda hari ini, kartu sesi yang seragam, dan detail sesi.
- Kompetisi: tab Fixtures / Results / Standings dengan tabel klasemen responsif dan kartu pertandingan konsisten.
- Keuangan: ringkasan pemasukan/pengeluaran/saldo, daftar transaksi dengan badge kategori, dan detail transaksi.

## 5. Interaksi & form

- Pasang `<Toaster />` (sonner) satu kali di root dan gunakan toast untuk aksi form.
- Rapikan form pemain: label, deskripsi bantuan, pesan error inline, status submitting pada tombol.
- Modal/dialog: ukuran responsif (full-width di mobile), fokus trap, tombol aksi konsisten.
- Command palette: shortcut ⌘K/Ctrl+K, grup hasil per section, hint keyboard.
- Skeleton loading, empty state, dan error state melalui komponen `DataState` yang sudah ada di setiap panel data.

## Catatan teknis

- Token warna, radius, dan shadow ditambahkan/dirapikan di `src/styles.css` (`:root`, `.dark`, `@theme inline`). Tidak ada kelas warna hardcoded di komponen.
- Perubahan menyentuh komponen di `src/components/*` dan route di `src/routes/*`; hook dan repository tidak diubah.
- Setiap route tetap punya `head()` masing-masing; judul/description dicek ulang agar unik.
- Verifikasi akhir: build bersih, cek visual pada lebar 375px, 768px, dan 1280px, plus dark mode.

## Di luar ruang lingkup

- Mengaktifkan Lovable Cloud atau mengganti sumber data.
- Fitur/route baru dan perubahan aturan bisnis.
