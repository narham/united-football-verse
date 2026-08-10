/**
 * Repository Interface Types
 * Abstraction layer for domain entities independent of storage backend
 * Compatible with both demo (localStorage) and future Supabase repositories
 */

// ============================================================
// Domain Types (mirrors demo-data types for consistency)
// ============================================================

export type PlayerPosition = "GK" | "DF" | "MF" | "FW";
export type PlayerStatus = "Aktif" | "Cadangan" | "Cedera" | "Nonaktif";
export type StaffRole =
  | "Kepala Pelatih"
  | "Asisten Pelatih"
  | "Pelatih Kiper"
  | "Fisioterapis"
  | "Manager"
  | "Operator";

export type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpha" | "terlambat";
export type MatchVenue = "Kandang" | "Tandang" | "Netral";
export type MatchResult = "win" | "draw" | "loss" | "upcoming";
export type TransactionType = "masuk" | "keluar";
export type TransactionCategory =
  | "SPP"
  | "Registration"
  | "Tournament"
  | "Equipment"
  | "Operational"
  | "Other";

// ============================================================
// Aggregate Roots & Entities
// ============================================================

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

export interface SeasonStat {
  season: string;
  apps: number;
  goals: number;
  assists: number;
  minutes: number;
}

export interface Player {
  id: string;
  clubId: string;
  football_id: string;
  name: string;
  posisi: PlayerPosition;
  nomor: number;
  tanggalLahir: string;
  status: PlayerStatus;
  tinggi: number;
  berat: number;
  kaki: "Kiri" | "Kanan";
  citizenship?: "INDONESIAN" | "FOREIGN";
  fotoUrl?: string;
  stats: SeasonStat[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Staff {
  id: string;
  clubId: string;
  name: string;
  role: StaffRole;
  telephone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Team {
  id: string;
  clubId: string;
  name: string;
  ageGroup: string;
  season: string;
  coach?: string;
  status: "Aktif" | "Tidak Aktif";
  createdAt?: string;
  updatedAt?: string;
}

export interface Season {
  id: string;
  clubId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "Aktif" | "Tidak Aktif" | "Selesai";
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingSession {
  id: string;
  clubId: string;
  teamId?: string;
  title: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  focus: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Attendance {
  id: string;
  trainingId: string;
  playerId: string;
  status: AttendanceStatus;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Competition {
  id: string;
  clubId: string;
  name: string;
  season: string;
  level: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Match {
  id: string;
  clubId: string;
  competitionId: string;
  competitionName: string;
  lawan: string;
  tanggal: string;
  skorHome: number | null;
  skorAway: number | null;
  venue: MatchVenue;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  clubId: string;
  tanggal: string;
  tipe: TransactionType;
  jumlah: number;
  kategori: TransactionCategory | string;
  keterangan: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  clubId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  clubId: string;
  actor: string;
  action: "create" | "update" | "delete" | "read";
  entity: string;
  entityId: string;
  entityName: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// ============================================================
// Repository List/Filter Parameters
// ============================================================

export interface ListParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PlayerListParams extends ListParams {
  position?: PlayerPosition;
  status?: PlayerStatus;
  teamId?: string;
  season?: string;
}

export interface StaffListParams extends ListParams {
  role?: StaffRole;
  status?: string;
}

export interface TrainingListParams extends ListParams {
  teamId?: string;
  date?: string;
  day?: string;
}

export interface MatchListParams extends ListParams {
  competitionId?: string;
  season?: string;
  status?: "upcoming" | "completed" | "all";
}

export interface TransactionListParams extends ListParams {
  type?: TransactionType;
  category?: TransactionCategory;
  dateFrom?: string;
  dateTo?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================================
// Create/Update Input Types
// ============================================================

export interface CreatePlayerInput {
  name: string;
  posisi: PlayerPosition;
  nomor: number;
  tanggalLahir: string;
  status: PlayerStatus;
  tinggi: number;
  berat: number;
  kaki: "Kiri" | "Kanan";
  citizenship?: "INDONESIAN" | "FOREIGN";
  fotoUrl?: string;
}

export interface UpdatePlayerInput extends Partial<CreatePlayerInput> {}

export interface CreateStaffInput {
  name: string;
  role: StaffRole;
  telephone?: string;
  email?: string;
}

export interface UpdateStaffInput extends Partial<CreateStaffInput> {}

export interface CreateTeamInput {
  name: string;
  category?: string;
  ageGroup?: string;
  seasonId?: string;
  season?: string;
  coach?: string;
}

export interface UpdateTeamInput extends Partial<CreateTeamInput> {
  status?: "Aktif" | "Tidak Aktif" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
}

export interface CreateSeasonInput {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateSeasonInput extends Partial<CreateSeasonInput> {
  status?: "Aktif" | "Tidak Aktif" | "Selesai";
}

export interface CreateTrainingInput {
  title: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  focus: string;
  teamId?: string;
}

export interface UpdateTrainingInput extends Partial<CreateTrainingInput> {}

export interface RecordAttendanceInput {
  trainingId: string;
  playerId: string;
  status: AttendanceStatus;
  date: string;
}

export interface CreateCompetitionInput {
  name: string;
  season?: string;
  seasonId?: string;
  level: string;
}

export interface UpdateCompetitionInput extends Partial<CreateCompetitionInput> {}

export interface CreateMatchInput {
  competitionId: string;
  lawan: string;
  tanggal: string;
  venue: MatchVenue;
  competitionName: string;
  teamId?: string;
  skorHome?: number | null;
  skorAway?: number | null;
}

export interface UpdateMatchInput {
  lawan?: string;
  tanggal?: string;
  venue?: MatchVenue;
  skorHome?: number | null;
  skorAway?: number | null;
  status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "ARCHIVED";
}

export interface CreateTransactionInput {
  tanggal: string;
  tipe: TransactionType;
  jumlah: number;
  kategori: TransactionCategory | string;
  keterangan: string;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {}

// ============================================================
// Repository Result Types
// ============================================================

export interface ListResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

export interface RepositoryError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// ============================================================
// Derived Data Types
// ============================================================

export interface FinanceTotals {
  masuk: number;
  keluar: number;
  saldo: number;
}

export interface TeamStats {
  apps: number;
  goals: number;
  assists: number;
}

export interface MatchRecordStats {
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
}

export interface PlayerPerformanceRating {
  label: string;
  score: number;
  grade: "A" | "B" | "C" | "D" | "E" | "-";
}

// ============================================================
// Repository Hook Result
// ============================================================

export interface RepositoryHookResult<T> {
  data: T | null;
  loading: boolean;
  error: RepositoryError | null;
}

export interface RepositoryMutationResult<T> {
  data: T | null;
  loading: boolean;
  error: RepositoryError | null;
}
