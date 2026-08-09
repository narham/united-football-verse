// Demo data untuk bolaID Football OS — browser-safe, TIDAK ADA dependency backend.
// Dipakai langsung oleh komponen. Saat Supabase diaktifkan, ganti dengan repository
// pattern: DemoRepository → SupabaseRepository.
//
// Semua relasi data (clubId, playerId, competitionId) KONSISTEN mengikuti struktur
// target PostgreSQL di docs/db-schema.md.

// ============================================================
// §16 DOMAIN TYPES (strongly-typed, tidak menggunakan `any`)
// ============================================================

export type PlayerPosition = "GK" | "DF" | "MF" | "FW";

export type PlayerStatus = "Aktif" | "Cadangan" | "Cedera" | "Nonaktif";

export type MatchResult = "win" | "draw" | "loss" | "upcoming";

export type TxType = "masuk" | "keluar";

export type TxCat =
  | "SPP"
  | "Registration"
  | "Tournament"
  | "Equipment"
  | "Operational"
  | "Other";

export type StaffRole =
  | "Kepala Pelatih"
  | "Asisten Pelatih"
  | "Pelatih Kiper"
  | "Fisioterapis"
  | "Manager"
  | "Operator";

// ---- Aggregate Root: Club ----
export interface Club {
  id: string;
  name: string;
  short: string;
  city: string;
  foundedYear: number;
  season: string;
  sport: string;
  logoUrl?: string;
  footballOrgId?: string;
}

// ---- Identity: Player (per §19 football_id adalah identity reference STABLE) ----
export interface Player {
  id: string;
  clubId: string;
  football_id: string; // Identity reference TETAP STABLE meskipun pemain pindah klub
  name: string;
  posisi: PlayerPosition;
  nomor: number;
  tanggalLahir: string;
  status: PlayerStatus;
  tinggi: number;
  berat: number;
  kaki: "Kiri" | "Kanan";
  fotoUrl?: string;
  stats: SeasonStat[];
}

export interface SeasonStat {
  season: string;
  apps: number;
  goals: number;
  assists: number;
  minutes: number;
}

export interface PlayerStats extends SeasonStat {
  playerId: string;
}

// ---- Staff (CAP-ORG-003) ----
export interface Staff {
  id: string;
  clubId: string;
  name: string;
  role: StaffRole;
  telephone?: string;
}

// ---- Training ----
export interface TrainingSession {
  id: string;
  clubId: string;
  title: string; // Fokus/judul sesi
  day: string; // Hari: Senin dst.
  startTime: string;
  endTime: string;
  location: string;
  focus: string;
}

// Attendance didefinisikan type-nya, data demo TIDAK di-generate karena jumlah besar
// (placeholder siap di-backend). §12: UI attendance placeholder siap.
export interface Attendance {
  id: string;
  trainingId: string;
  playerId: string;
  status: "hadir" | "sakit" | "izin" | "alpha" | "terlambat";
  date: string; // YYYY-MM-DD
}

// ---- Competition & Match ----
export interface Competition {
  id: string;
  name: string;
  season: string;
  level: string; // U-19 Regional, Liga SSB, dsb.
}

export interface Match {
  id: string;
  clubId: string;
  competitionId: string;
  competitionName: string; // denormalized for demo display
  lawan: string;
  tanggal: string; // YYYY-MM-DD
  skorHome: number | null; // null = upcoming
  skorAway: number | null;
  venue: "Kandang" | "Tandang" | "Netral";
}

// ---- Finance ----
export interface Transaction {
  id: string;
  clubId: string;
  tanggal: string;
  tipe: TxType;
  jumlah: number;
  kategori: TxCat | string;
  keterangan: string;
}

// ============================================================
// §17 DEMO DATA — SSB GARUDA MUDA (satu sumber data KONSISTEN)
// ============================================================

export const DEFAULT_CLUB_ID = "club-garuda";

export const club: Club = {
  id: DEFAULT_CLUB_ID,
  name: "SSB Garuda Muda",
  short: "GRD",
  city: "Bandung",
  foundedYear: 2012,
  season: "2026/2027",
  sport: "Sepak Bola",
  footballOrgId: "ASPJABAR-SSB-0127",
};

// Daftar klub untuk Club Switcher placeholder (§6 AppHeader)
export const clubs: Club[] = [
  club,
  {
    id: "club-harapan",
    name: "SSB Harapan Baru",
    short: "HRB",
    city: "Cimahi",
    foundedYear: 2015,
    season: "2026/2027",
    sport: "Sepak Bola",
  },
  {
    id: "club-elang",
    name: "Akademi Elang Putih",
    short: "ELP",
    city: "Soreang",
    foundedYear: 2018,
    season: "2026/2027",
    sport: "Sepak Bola",
  },
];

// Competitions (CAP-CMP-001)
export const competitions: Competition[] = [
  { id: "cmp-1", name: "Liga SSB Jaya", season: "2026", level: "Regional Jawa Barat — U-19" },
  { id: "cmp-2", name: "Piala Gensa Cup", season: "2026", level: "Turnamen Antar SSB — Open" },
  { id: "cmp-3", name: "Liga SSB Jaya", season: "2026/2027", level: "Regional Jawa Barat — U-19" },
];

// Helper position label (digunakan di PositionBadge / detail)
const posisiLabels: Record<PlayerPosition, string> = {
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

// Football ID format untuk demo: BID-{birthYear-last2}-{clubCode}-{seq4}
// Catatan §19: Football ID TIDAK BOLEH berubah ketika pemain pindah klub.
// Struktur ini memungkinkan identity tetap stabil.
function fid(thnLahir: string, seq: number) {
  const y2 = thnLahir.slice(2, 4);
  return `BID-${y2}-GRD-${String(seq).padStart(4, "0")}`;
}

// 20 Pemain roster (sesuai spec ±20 pemain)
export const players: Player[] = [
  { id: "p1",  clubId: DEFAULT_CLUB_ID, football_id: fid("2008", 1),  name: "Bagas Pratama",     posisi: "GK", nomor: 1,  tanggalLahir: "2008-03-12", status: "Aktif",    tinggi: 178, berat: 68, kaki: "Kanan",  stats: stat(18, 0, 1, 1620) },
  { id: "p2",  clubId: DEFAULT_CLUB_ID, football_id: fid("2007", 2),  name: "Rizky Maulana",    posisi: "DF", nomor: 2,  tanggalLahir: "2007-11-04", status: "Aktif",    tinggi: 175, berat: 65, kaki: "Kanan",  stats: stat(20, 2, 3, 1740) },
  { id: "p3",  clubId: DEFAULT_CLUB_ID, football_id: fid("2007", 3),  name: "Fajar Nugroho",    posisi: "DF", nomor: 4,  tanggalLahir: "2007-09-21", status: "Aktif",    tinggi: 180, berat: 72, kaki: "Kiri",   stats: stat(19, 1, 2, 1680) },
  { id: "p4",  clubId: DEFAULT_CLUB_ID, football_id: fid("2008", 4),  name: "Dimas Anggara",    posisi: "DF", nomor: 5,  tanggalLahir: "2008-01-30", status: "Aktif",    tinggi: 177, berat: 70, kaki: "Kanan",  stats: stat(17, 0, 4, 1450) },
  { id: "p5",  clubId: DEFAULT_CLUB_ID, football_id: fid("2007", 5),  name: "Yusuf Hidayat",    posisi: "DF", nomor: 3,  tanggalLahir: "2007-12-15", status: "Cadangan", tinggi: 173, berat: 66, kaki: "Kanan",  stats: stat(12, 0, 1, 810)  },
  { id: "p6",  clubId: DEFAULT_CLUB_ID, football_id: fid("2008", 6),  name: "Arif Rahman",      posisi: "MF", nomor: 6,  tanggalLahir: "2008-05-08", status: "Aktif",    tinggi: 170, berat: 63, kaki: "Kanan",  stats: stat(21, 3, 7, 1820) },
  { id: "p7",  clubId: DEFAULT_CLUB_ID, football_id: fid("2007", 7),  name: "Galang Saputra",   posisi: "MF", nomor: 8,  tanggalLahir: "2007-07-19", status: "Aktif",    tinggi: 172, berat: 64, kaki: "Kiri",   stats: stat(22, 5, 9, 1880) },
  { id: "p8",  clubId: DEFAULT_CLUB_ID, football_id: fid("2008", 8),  name: "Reza Pratama",     posisi: "MF", nomor: 10, tanggalLahir: "2008-02-25", status: "Aktif",    tinggi: 168, berat: 61, kaki: "Kanan",  stats: stat(20, 8, 11, 1720) },
  { id: "p9",  clubId: DEFAULT_CLUB_ID, football_id: fid("2007", 9),  name: "Bayu Setiawan",    posisi: "MF", nomor: 7,  tanggalLahir: "2007-10-11", status: "Cedera",   tinggi: 169, berat: 62, kaki: "Kanan",  stats: stat(14, 4, 6, 1180) },
  { id: "p10", clubId: DEFAULT_CLUB_ID, football_id: fid("2008", 10), name: "Andi Wijaya",      posisi: "MF", nomor: 14, tanggalLahir: "2008-06-02", status: "Cadangan", tinggi: 171, berat: 63, kaki: "Kiri",   stats: stat(9, 1, 3, 620)   },
  { id: "p11", clubId: DEFAULT_CLUB_ID, football_id: fid("2007", 11), name: "Surya Darma",      posisi: "FW", nomor: 9,  tanggalLahir: "2007-08-17", status: "Aktif",    tinggi: 176, berat: 69, kaki: "Kanan",  stats: stat(21, 16, 5, 1780) },
  { id: "p12", clubId: DEFAULT_CLUB_ID, football_id: fid("2008", 12), name: "Kevin Halim",      posisi: "FW", nomor: 11, tanggalLahir: "2008-04-23", status: "Aktif",    tinggi: 174, berat: 67, kaki: "Kiri",   stats: stat(18, 12, 8, 1520) },
  { id: "p13", clubId: DEFAULT_CLUB_ID, football_id: fid("2007", 13), name: "Tio Fernandes",    posisi: "FW", nomor: 19, tanggalLahir: "2007-12-09", status: "Cadangan", tinggi: 170, berat: 65, kaki: "Kanan",  stats: stat(11, 6, 4, 940)   },
  { id: "p14", clubId: DEFAULT_CLUB_ID, football_id: fid("2008", 14), name: "Naufal Akbar",     posisi: "GK", nomor: 22, tanggalLahir: "2008-09-14", status: "Cadangan", tinggi: 181, berat: 71, kaki: "Kanan",  stats: stat(6, 0, 0, 540)    },
  { id: "p15", clubId: DEFAULT_CLUB_ID, football_id: fid("2008", 15), name: "Ilham Pratomo",    posisi: "DF", nomor: 15, tanggalLahir: "2008-11-22", status: "Aktif",    tinggi: 179, berat: 71, kaki: "Kanan",  stats: stat(15, 1, 2, 1280) },
  { id: "p16", clubId: DEFAULT_CLUB_ID, football_id: fid("2007", 16), name: "Dedi Kurnia",      posisi: "DF", nomor: 18, tanggalLahir: "2007-06-05", status: "Cadangan", tinggi: 174, berat: 68, kaki: "Kanan",  stats: stat(8, 0, 1, 560)    },
  { id: "p17", clubId: DEFAULT_CLUB_ID, football_id: fid("2008", 17), name: "Raka Pahlevi",     posisi: "MF", nomor: 16, tanggalLahir: "2008-07-28", status: "Aktif",    tinggi: 173, berat: 64, kaki: "Kanan",  stats: stat(16, 4, 5, 1340) },
  { id: "p18", clubId: DEFAULT_CLUB_ID, football_id: fid("2007", 18), name: "Bima Sakti",       posisi: "MF", nomor: 20, tanggalLahir: "2007-04-13", status: "Cedera",   tinggi: 167, berat: 60, kaki: "Kiri",   stats: stat(10, 3, 4, 870)   },
  { id: "p19", clubId: DEFAULT_CLUB_ID, football_id: fid("2008", 19), name: "Ega Prasetyo",     posisi: "FW", nomor: 21, tanggalLahir: "2008-08-30", status: "Cadangan", tinggi: 172, berat: 66, kaki: "Kanan",  stats: stat(7, 3, 2, 410)    },
  { id: "p20", clubId: DEFAULT_CLUB_ID, football_id: fid("2007", 20), name: "Zaki Maulana",     posisi: "FW", nomor: 27, tanggalLahir: "2007-05-19", status: "Aktif",    tinggi: 175, berat: 68, kaki: "Kanan",  stats: stat(13, 7, 3, 1040)  },
];

// Staff (CAP-ORG-003)
export const staff: Staff[] = [
  { id: "st-1", clubId: DEFAULT_CLUB_ID, name: "Drs. H. Suherman, M.Pd.", role: "Kepala Pelatih", telephone: "0812-2001-0101" },
  { id: "st-2", clubId: DEFAULT_CLUB_ID, name: "Asep Sutisna",            role: "Asisten Pelatih", telephone: "0813-2002-0202" },
  { id: "st-3", clubId: DEFAULT_CLUB_ID, name: "Hendra Kurniawan",        role: "Pelatih Kiper",   telephone: "0812-2003-0303" },
  { id: "st-4", clubId: DEFAULT_CLUB_ID, name: "dr. Rina Permatasari",    role: "Fisioterapis",    telephone: "0811-2004-0404" },
  { id: "st-5", clubId: DEFAULT_CLUB_ID, name: "Agus Setiawan",           role: "Manager",         telephone: "0821-2005-0505" },
  { id: "st-6", clubId: DEFAULT_CLUB_ID, name: "Fikri Ramadhan",          role: "Operator",        telephone: "0858-2006-0606" },
];

// Training Sessions
export const trainingSessions: TrainingSession[] = [
  { id: "t1", clubId: DEFAULT_CLUB_ID, title: "Fisik & Stamina",      day: "Senin", startTime: "15:00", endTime: "17:00", location: "Lapangan A", focus: "Fisik & Stamina" },
  { id: "t2", clubId: DEFAULT_CLUB_ID, title: "Teknik & Passing",      day: "Rabu",  startTime: "15:00", endTime: "17:00", location: "Lapangan A", focus: "Teknik & Passing" },
  { id: "t3", clubId: DEFAULT_CLUB_ID, title: "Taktik & Formasi",      day: "Jumat", startTime: "16:00", endTime: "18:00", location: "Lapangan B", focus: "Taktik & Formasi" },
  { id: "t4", clubId: DEFAULT_CLUB_ID, title: "Mini Game Scrimmage",   day: "Sabtu", startTime: "08:00", endTime: "10:00", location: "Lapangan A", focus: "Mini Game & Scrimmage" },
];

// Matches (CAP-CMP-002)
// 3 pertandingan selesai, 1 imbang, 1 kalah, 2 upcoming
export const matches: Match[] = [
  { id: "m1", clubId: DEFAULT_CLUB_ID, competitionId: "cmp-1", competitionName: "Liga SSB Jaya 2026",        lawan: "SSB Persada Junior",     tanggal: "2026-08-02", skorHome: 3, skorAway: 1, venue: "Kandang" },
  { id: "m2", clubId: DEFAULT_CLUB_ID, competitionId: "cmp-1", competitionName: "Liga SSB Jaya 2026",        lawan: "SSB Muda Mandiri",       tanggal: "2026-07-26", skorHome: 0, skorAway: 0, venue: "Tandang" },
  { id: "m3", clubId: DEFAULT_CLUB_ID, competitionId: "cmp-2", competitionName: "Piala Gensa Cup 2026",      lawan: "SSB Elang Putih",        tanggal: "2026-07-19", skorHome: 2, skorAway: 1, venue: "Tandang" },
  { id: "m4", clubId: DEFAULT_CLUB_ID, competitionId: "cmp-1", competitionName: "Liga SSB Jaya 2026",        lawan: "SSB Harapan Bangsa",     tanggal: "2026-07-12", skorHome: 1, skorAway: 2, venue: "Kandang" },
  { id: "m5", clubId: DEFAULT_CLUB_ID, competitionId: "cmp-2", competitionName: "Piala Gensa Cup 2026",      lawan: "SSB Tunas Mekar",        tanggal: "2026-07-05", skorHome: 4, skorAway: 0, venue: "Kandang" },
  // UPCOMING matches — skor null untuk mendukung spec §12 status "upcoming"
  { id: "m6", clubId: DEFAULT_CLUB_ID, competitionId: "cmp-3", competitionName: "Liga SSB Jaya 2026/2027",   lawan: "SSB Nusantara Muda",     tanggal: "2026-08-16", skorHome: null, skorAway: null, venue: "Kandang" },
  { id: "m7", clubId: DEFAULT_CLUB_ID, competitionId: "cmp-3", competitionName: "Liga SSB Jaya 2026/2027",   lawan: "SSB Bintang Selatan",    tanggal: "2026-08-23", skorHome: null, skorAway: null, venue: "Tandang" },
];

// Transactions (CAP-FIN-002) — kategori sesuai §14
export const transactions: Transaction[] = [
  { id: "tx1", clubId: DEFAULT_CLUB_ID, tanggal: "2026-08-01", tipe: "masuk",  jumlah: 12000000, kategori: "SPP",          keterangan: "SPP 24 pemain — Agustus 2026" },
  { id: "tx2", clubId: DEFAULT_CLUB_ID, tanggal: "2026-07-30", tipe: "masuk",  jumlah: 8000000,  kategori: "Registration", keterangan: "Pendaftaran pemain baru musim 2026/27" },
  { id: "tx3", clubId: DEFAULT_CLUB_ID, tanggal: "2026-07-28", tipe: "keluar", jumlah: 3500000,  kategori: "Operational",  keterangan: "Sewa Lapangan A — 4 sesi / bulan" },
  { id: "tx4", clubId: DEFAULT_CLUB_ID, tanggal: "2026-07-25", tipe: "keluar", jumlah: 1800000,  kategori: "Equipment",    keterangan: "Jersey + training kit musim 2026/27" },
  { id: "tx5", clubId: DEFAULT_CLUB_ID, tanggal: "2026-07-20", tipe: "masuk",  jumlah: 5000000,  kategori: "Other",        keterangan: "Sponsor — Toko Olahraga Jaya" },
  { id: "tx6", clubId: DEFAULT_CLUB_ID, tanggal: "2026-07-15", tipe: "keluar", jumlah: 900000,   kategori: "Tournament",   keterangan: "Biaya daftar Piala Gensa Cup 2026" },
  { id: "tx7", clubId: DEFAULT_CLUB_ID, tanggal: "2026-07-10", tipe: "keluar", jumlah: 600000,   kategori: "Operational",  keterangan: "Konsumsi latihan mingguan (Juli minggu 1-2)" },
];

// ============================================================
// Derived / Helper Functions — TETAP PURE untuk repository wrapper
// ============================================================

export function matchResult(m: Match): MatchResult {
  if (m.skorHome === null || m.skorAway === null) return "upcoming";
  const isHome = m.venue === "Kandang" || m.venue === "Netral";
  const homeForUs = isHome ? m.skorHome : m.skorAway;
  const awayForUs = isHome ? m.skorAway : m.skorHome;
  if (homeForUs === awayForUs) return "draw";
  return homeForUs > awayForUs ? "win" : "loss";
}

export function usia(tanggalLahir: string, refDate = "2026-08-09"): number {
  const t = new Date(tanggalLahir);
  const now = new Date(refDate);
  let a = now.getFullYear() - t.getFullYear();
  const m = now.getMonth() - t.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < t.getDate())) a--;
  return a;
}

export function formatRupiah(n: number): string {
  return "Rp" + n.toLocaleString("id-ID");
}

export function seasonStatsTotal(
  player: Player,
  season = "2025/2026",
): SeasonStat {
  const s = player.stats.find((x) => x.season === season);
  return s ?? { season, apps: 0, goals: 0, assists: 0, minutes: 0 };
}

export function teamStatTotals(season = "2025/2026") {
  let apps = 0, goals = 0, assists = 0;
  for (const p of players) {
    const s = seasonStatsTotal(p, season);
    apps += s.apps;
    goals += s.goals;
    assists += s.assists;
  }
  return { apps, goals, assists };
}

// Rekam W-D-L-GF-GA dari pertandingan yang SUDAH DIMAINKAN saja
export function matchRecord() {
  let w = 0, d = 0, l = 0, gf = 0, ga = 0;
  for (const m of matches) {
    const r = matchResult(m);
    if (r === "upcoming") continue;
    if (r === "win") w++;
    else if (r === "draw") d++;
    else l++;
    const isHome = m.venue === "Kandang" || m.venue === "Netral";
    const ourGoals = isHome ? (m.skorHome ?? 0) : (m.skorAway ?? 0);
    const conceded = isHome ? (m.skorAway ?? 0) : (m.skorHome ?? 0);
    gf += ourGoals;
    ga += conceded;
  }
  return { w, d, l, gf, ga };
}

// Upcoming saja untuk Dashboard §9 "Upcoming Training"
export function upcomingMatches() {
  return matches.filter((m) => matchResult(m) === "upcoming");
}

export function pastMatches() {
  return matches.filter((m) => matchResult(m) !== "upcoming");
}

export function financeTotals() {
  let masuk = 0, keluar = 0;
  for (const t of transactions) {
    if (t.tipe === "masuk") masuk += t.jumlah;
    else keluar += t.jumlah;
  }
  return { masuk, keluar, saldo: masuk - keluar };
}

export function playerById(id: string): Player | undefined {
  return players.find((p) => p.id === id);
}

export function matchById(id: string): Match | undefined {
  return matches.find((m) => m.id === id);
}

export function transactionById(id: string): Transaction | undefined {
  return transactions.find((t) => t.id === id);
}

export function competitionById(id: string): Competition | undefined {
  return competitions.find((c) => c.id === id);
}

// Rating performa sederhana (untuk PlayerProfileCard performance summary)
// Tidak membuat data baru — derived dari stats yang sudah ada (aturan §11: Jangan mengarang data)
export function playerPerformanceRating(player: Player, season = "2025/2026") {
  const s = seasonStatsTotal(player, season);
  if (s.apps === 0) return { label: "Belum ada data", score: 0, grade: "-" as const };
  // Formula sederhana: kontribusi per 90 menit, bobot: goal berat, assist sedang
  const per90 = s.minutes / 90 || 1;
  const gaa90 = (s.goals * 3 + s.assists * 2) / per90;
  const score = Math.min(100, Math.round(30 + gaa90 * 15 + s.apps * 1.2));
  let grade: "A" | "B" | "C" | "D" | "E";
  if (score >= 85) grade = "A";
  else if (score >= 70) grade = "B";
  else if (score >= 55) grade = "C";
  else if (score >= 40) grade = "D";
  else grade = "E";
  const label =
    grade === "A" ? "Luar Biasa"
    : grade === "B" ? "Baik"
    : grade === "C" ? "Cukup"
    : grade === "D" ? "Perlu Perbaikan"
    : "Belum Optimal";
  return { score, grade, label };
}
