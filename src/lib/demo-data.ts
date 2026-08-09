// Demo data untuk bolaID Football OS — browser-safe, tidak ada backend.
// Dipakai langsung oleh komponen. Saat Lovable Cloud diaktifkan, ganti dengan
// fetcher via createServerFn + query. Struktur tipe sudah mengikuti skema DB.

export type Position = "GK" | "DF" | "MF" | "FW";
export type PlayerStatus = "Aktif" | "Cadangan" | "Cedera";
export type MatchResult = "W" | "D" | "L";
export type TxType = "masuk" | "keluar";

export interface Club {
  id: string;
  name: string;
  short: string;
  city: string;
  foundedYear: number;
  season: string;
}

export interface SeasonStat {
  season: string;
  apps: number;
  goals: number;
  assists: number;
  minutes: number;
}

export interface Player {
  id: string;
  name: string;
  posisi: Position;
  nomor: number;
  tanggalLahir: string;
  status: PlayerStatus;
  tinggi: number;
  berat: number;
  kaki: "Kiri" | "Kanan";
  stats: SeasonStat[];
}

export interface TrainingSession {
  id: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  lokasi: string;
  fokus: string;
}

export interface Match {
  id: string;
  competition: string;
  lawan: string;
  tanggal: string;
  skorHome: number;
  skorAway: number;
  venue: "Kandang" | "Tandang";
}

export interface Transaction {
  id: string;
  tanggal: string;
  tipe: TxType;
  jumlah: number;
  kategori: string;
  keterangan: string;
}

export const club: Club = {
  id: "club-garuda",
  name: "SSB Garuda Muda",
  short: "GRD",
  city: "Bandung",
  foundedYear: 2012,
  season: "2026/2027",
};

const posisiLabels: Record<Position, string> = {
  GK: "Penjaga Gawang",
  DF: "Bek",
  MF: "Gelandang",
  FW: "Penyerang",
};
export { posisiLabels };

function stat(apps: number, goals: number, assists: number, minutes: number): SeasonStat[] {
  return [
    { season: "2025/2026", apps, goals, assists, minutes },
    {
      season: "2024/2025",
      apps: Math.max(1, apps - 4),
      goals: Math.max(0, goals - 2),
      assists: Math.max(0, assists - 1),
      minutes: Math.max(0, minutes - 350),
    },
  ];
}

export const players: Player[] = [
  { id: "p1", name: "Bagas Pratama", posisi: "GK", nomor: 1, tanggalLahir: "2008-03-12", status: "Aktif", tinggi: 178, berat: 68, kaki: "Kanan", stats: stat(18, 0, 1, 1620) },
  { id: "p2", name: "Rizky Maulana", posisi: "DF", nomor: 2, tanggalLahir: "2007-11-04", status: "Aktif", tinggi: 175, berat: 65, kaki: "Kanan", stats: stat(20, 2, 3, 1740) },
  { id: "p3", name: "Fajar Nugroho", posisi: "DF", nomor: 4, tanggalLahir: "2007-09-21", status: "Aktif", tinggi: 180, berat: 72, kaki: "Kiri", stats: stat(19, 1, 2, 1680) },
  { id: "p4", name: "Dimas Anggara", posisi: "DF", nomor: 5, tanggalLahir: "2008-01-30", status: "Aktif", tinggi: 177, berat: 70, kaki: "Kanan", stats: stat(17, 0, 4, 1450) },
  { id: "p5", name: "Yusuf Hidayat", posisi: "DF", nomor: 3, tanggalLahir: "2007-12-15", status: "Cadangan", tinggi: 173, berat: 66, kaki: "Kanan", stats: stat(12, 0, 1, 810) },
  { id: "p6", name: "Arif Rahman", posisi: "MF", nomor: 6, tanggalLahir: "2008-05-08", status: "Aktif", tinggi: 170, berat: 63, kaki: "Kanan", stats: stat(21, 3, 7, 1820) },
  { id: "p7", name: "Galang Saputra", posisi: "MF", nomor: 8, tanggalLahir: "2007-07-19", status: "Aktif", tinggi: 172, berat: 64, kaki: "Kiri", stats: stat(22, 5, 9, 1880) },
  { id: "p8", name: "Reza Pratama", posisi: "MF", nomor: 10, tanggalLahir: "2008-02-25", status: "Aktif", tinggi: 168, berat: 61, kaki: "Kanan", stats: stat(20, 8, 11, 1720) },
  { id: "p9", name: "Bayu Setiawan", posisi: "MF", nomor: 7, tanggalLahir: "2007-10-11", status: "Cedera", tinggi: 169, berat: 62, kaki: "Kanan", stats: stat(14, 4, 6, 1180) },
  { id: "p10", name: "Andi Wijaya", posisi: "MF", nomor: 14, tanggalLahir: "2008-06-02", status: "Cadangan", tinggi: 171, berat: 63, kaki: "Kiri", stats: stat(9, 1, 3, 620) },
  { id: "p11", name: "Surya Darma", posisi: "FW", nomor: 9, tanggalLahir: "2007-08-17", status: "Aktif", tinggi: 176, berat: 69, kaki: "Kanan", stats: stat(21, 16, 5, 1780) },
  { id: "p12", name: "Kevin Halim", posisi: "FW", nomor: 11, tanggalLahir: "2008-04-23", status: "Aktif", tinggi: 174, berat: 67, kaki: "Kiri", stats: stat(18, 12, 8, 1520) },
  { id: "p13", name: "Tio Fernandes", posisi: "FW", nomor: 19, tanggalLahir: "2007-12-09", status: "Cadangan", tinggi: 170, berat: 65, kaki: "Kanan", stats: stat(11, 6, 4, 940) },
  { id: "p14", name: "Naufal Akbar", posisi: "GK", nomor: 22, tanggalLahir: "2008-09-14", status: "Cadangan", tinggi: 181, berat: 71, kaki: "Kanan", stats: stat(6, 0, 0, 540) },
  { id: "p15", name: "Ilham Pratomo", posisi: "DF", nomor: 15, tanggalLahir: "2008-11-22", status: "Aktif", tinggi: 179, berat: 71, kaki: "Kanan", stats: stat(15, 1, 2, 1280) },
  { id: "p16", name: "Dedi Kurnia", posisi: "DF", nomor: 18, tanggalLahir: "2007-06-05", status: "Cadangan", tinggi: 174, berat: 68, kaki: "Kanan", stats: stat(8, 0, 1, 560) },
  { id: "p17", name: "Raka Pahlevi", posisi: "MF", nomor: 16, tanggalLahir: "2008-07-28", status: "Aktif", tinggi: 173, berat: 64, kaki: "Kanan", stats: stat(16, 4, 5, 1340) },
  { id: "p18", name: "Bima Sakti", posisi: "MF", nomor: 20, tanggalLahir: "2007-04-13", status: "Cedera", tinggi: 167, berat: 60, kaki: "Kiri", stats: stat(10, 3, 4, 870) },
  { id: "p19", name: "Ega Prasetyo", posisi: "FW", nomor: 21, tanggalLahir: "2008-08-30", status: "Cadangan", tinggi: 172, berat: 66, kaki: "Kanan", stats: stat(7, 3, 2, 410) },
  { id: "p20", name: "Zaki Maulana", posisi: "FW", nomor: 27, tanggalLahir: "2007-05-19", status: "Aktif", tinggi: 175, berat: 68, kaki: "Kanan", stats: stat(13, 7, 3, 1040) },
];

export const trainingSessions: TrainingSession[] = [
  { id: "t1", hari: "Senin", jamMulai: "15:00", jamSelesai: "17:00", lokasi: "Lapangan A", fokus: "Fisik & Stamina" },
  { id: "t2", hari: "Rabu", jamMulai: "15:00", jamSelesai: "17:00", lokasi: "Lapangan A", fokus: "Teknik & Passing" },
  { id: "t3", hari: "Jumat", jamMulai: "16:00", jamSelesai: "18:00", lokasi: "Lapangan B", fokus: "Taktik & Formasi" },
  { id: "t4", hari: "Sabtu", jamMulai: "08:00", jamSelesai: "10:00", lokasi: "Lapangan A", fokus: "Mini Game" },
];

export const matches: Match[] = [
  { id: "m1", competition: "Liga SSB Jaya 2026", lawan: "SSB Persada Junior", tanggal: "2026-08-02", skorHome: 3, skorAway: 1, venue: "Kandang" },
  { id: "m2", competition: "Liga SSB Jaya 2026", lawan: "SSB Muda Mandiri", tanggal: "2026-07-26", skorHome: 0, skorAway: 0, venue: "Tandang" },
  { id: "m3", competition: "Piala Gensa Cup", lawan: "SSB Elang Putih", tanggal: "2026-07-19", skorHome: 2, skorAway: 1, venue: "Tandang" },
  { id: "m4", competition: "Liga SSB Jaya 2026", lawan: "SSB Harapan Bangsa", tanggal: "2026-07-12", skorHome: 1, skorAway: 2, venue: "Kandang" },
  { id: "m5", competition: "Piala Gensa Cup", lawan: "SSB Tunas Mekar", tanggal: "2026-07-05", skorHome: 4, skorAway: 0, venue: "Kandang" },
];

export const transactions: Transaction[] = [
  { id: "tx1", tanggal: "2026-08-01", tipe: "masuk", jumlah: 12000000, kategori: "SPP Bulanan", keterangan: "SPP 24 pemain — Agustus" },
  { id: "tx2", tanggal: "2026-07-28", tipe: "keluar", jumlah: 3500000, kategori: "Operasional", keterangan: "Sewa Lapangan A — 4 sesi" },
  { id: "tx3", tanggal: "2026-07-25", tipe: "keluar", jumlah: 1800000, kategori: "Seragam", keterangan: "Jersey musim 2026/27" },
  { id: "tx4", tanggal: "2026-07-20", tipe: "masuk", jumlah: 5000000, kategori: "Sponsor", keterangan: "Sponsor — Toko Olahraga Jaya" },
  { id: "tx5", tanggal: "2026-07-15", tipe: "keluar", jumlah: 900000, kategori: "Kompetisi", keterangan: "Biaya daftar Gensa Cup" },
  { id: "tx6", tanggal: "2026-07-10", tipe: "keluar", jumlah: 600000, kategori: "Konsumsi", keterangan: "Konsumsi latihan mingguan" },
];

// --- Helpers turunan ---

export function matchResult(m: Match): MatchResult {
  const home = m.skorHome;
  const away = m.skorAway;
  const winKandang = home > away;
  const isHome = m.venue === "Kandang";
  const menang = isHome ? home > away : away > home;
  if (home === away) return "D";
  return (isHome ? winKandang : !winKandang) ? "W" : "L";
}

export function usia(tanggalLahir: string): number {
  const t = new Date(tanggalLahir);
  const now = new Date("2026-08-09");
  let a = now.getFullYear() - t.getFullYear();
  const m = now.getMonth() - t.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < t.getDate())) a--;
  return a;
}

export function formatRupiah(n: number): string {
  return "Rp" + n.toLocaleString("id-ID");
}

export function seasonStatsTotal(player: Player, season = "2025/2026"): SeasonStat {
  const s = player.stats.find((x) => x.season === season);
  return s ?? { season, apps: 0, goals: 0, assists: 0, minutes: 0 };
}

export function teamStatTotals() {
  const season = "2025/2026";
  let apps = 0,
    goals = 0,
    assists = 0;
  for (const p of players) {
    const s = seasonStatsTotal(p, season);
    apps += s.apps;
    goals += s.goals;
    assists += s.assists;
  }
  return { apps, goals, assists };
}

export function matchRecord() {
  let w = 0,
    d = 0,
    l = 0,
    gf = 0,
    ga = 0;
  for (const m of matches) {
    const r = matchResult(m);
    if (r === "W") w++;
    else if (r === "D") d++;
    else l++;
    const isHome = m.venue === "Kandang";
    gf += isHome ? m.skorHome : m.skorAway;
    ga += isHome ? m.skorAway : m.skorHome;
  }
  return { w, d, l, gf, ga };
}

export function financeTotals() {
  let masuk = 0,
    keluar = 0;
  for (const t of transactions) {
    if (t.tipe === "masuk") masuk += t.jumlah;
    else keluar += t.jumlah;
  }
  return { masuk, keluar, saldo: masuk - keluar };
}

export function playerById(id: string): Player | undefined {
  return players.find((p) => p.id === id);
}
