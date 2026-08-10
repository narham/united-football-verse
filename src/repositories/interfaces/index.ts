/**
 * Repository Interfaces
 * Define contract for all domain repositories
 */

import type {
  Player,
  PlayerListParams,
  CreatePlayerInput,
  UpdatePlayerInput,
  ListResult,
  Staff,
  StaffListParams,
  CreateStaffInput,
  UpdateStaffInput,
  Team,
  CreateTeamInput,
  UpdateTeamInput,
  Season,
  CreateSeasonInput,
  UpdateSeasonInput,
  TrainingSession,
  TrainingListParams,
  CreateTrainingInput,
  UpdateTrainingInput,
  Attendance,
  RecordAttendanceInput,
  Competition,
  CreateCompetitionInput,
  UpdateCompetitionInput,
  Match,
  MatchListParams,
  CreateMatchInput,
  UpdateMatchInput,
  MatchResult,
  Transaction,
  TransactionListParams,
  CreateTransactionInput,
  UpdateTransactionInput,
  FinanceTotals,
  TeamStats,
  MatchRecordStats,
  PlayerPerformanceRating,
  Notification,
  ActivityLog,
  Club,
  SeasonStat,
} from "./types";

export type {
  Player,
  PlayerListParams,
  CreatePlayerInput,
  UpdatePlayerInput,
  ListResult,
  Staff,
  StaffListParams,
  CreateStaffInput,
  UpdateStaffInput,
  Team,
  CreateTeamInput,
  UpdateTeamInput,
  Season,
  CreateSeasonInput,
  UpdateSeasonInput,
  TrainingSession,
  TrainingListParams,
  CreateTrainingInput,
  UpdateTrainingInput,
  Attendance,
  RecordAttendanceInput,
  Competition,
  CreateCompetitionInput,
  UpdateCompetitionInput,
  Match,
  MatchListParams,
  CreateMatchInput,
  UpdateMatchInput,
  MatchResult,
  Transaction,
  TransactionListParams,
  CreateTransactionInput,
  UpdateTransactionInput,
  FinanceTotals,
  TeamStats,
  MatchRecordStats,
  PlayerPerformanceRating,
  Notification,
  ActivityLog,
  Club,
  SeasonStat,
} from "./types";

// ============================================================
// Player Repository
// ============================================================
export interface PlayerRepository {
  list(clubId: string, params?: PlayerListParams): Promise<ListResult<Player>>;
  getById(id: string): Promise<Player | null>;
  create(clubId: string, input: CreatePlayerInput): Promise<Player>;
  update(id: string, input: UpdatePlayerInput): Promise<Player>;
  delete(id: string): Promise<void>;
  getByFootballId(footballId: string): Promise<Player | null>;
  getStats(playerId: string, season: string): Promise<any>;
  getPerformanceRating(playerId: string, season?: string): Promise<PlayerPerformanceRating>;
}

// ============================================================
// Staff Repository
// ============================================================
export interface StaffRepository {
  list(clubId: string, params?: StaffListParams): Promise<ListResult<Staff>>;
  getById(id: string): Promise<Staff | null>;
  create(clubId: string, input: CreateStaffInput): Promise<Staff>;
  update(id: string, input: UpdateStaffInput): Promise<Staff>;
  delete(id: string): Promise<void>;
}

// ============================================================
// Team Repository
// ============================================================
export interface TeamRepository {
  list(clubId: string): Promise<Team[]>;
  getById(id: string): Promise<Team | null>;
  create(clubId: string, input: CreateTeamInput): Promise<Team>;
  update(id: string, input: UpdateTeamInput): Promise<Team>;
  delete(id: string): Promise<void>;
  getStats(teamId: string, season: string): Promise<TeamStats>;
}

// ============================================================
// Season Repository
// ============================================================
export interface SeasonRepository {
  list(clubId: string): Promise<Season[]>;
  getById(id: string): Promise<Season | null>;
  create(clubId: string, input: CreateSeasonInput): Promise<Season>;
  update(id: string, input: UpdateSeasonInput): Promise<Season>;
  delete(id: string): Promise<void>;
  getActive(clubId: string): Promise<Season | null>;
  setActive(id: string): Promise<void>;
}

// ============================================================
// Training Repository
// ============================================================
export interface TrainingRepository {
  list(clubId: string, params?: TrainingListParams): Promise<ListResult<TrainingSession>>;
  getById(id: string): Promise<TrainingSession | null>;
  create(clubId: string, input: CreateTrainingInput): Promise<TrainingSession>;
  update(id: string, input: UpdateTrainingInput): Promise<TrainingSession>;
  delete(id: string): Promise<void>;
  recordAttendance(input: RecordAttendanceInput): Promise<Attendance>;
  getAttendance(trainingId: string): Promise<Attendance[]>;
  getAttendanceByDate(clubId: string, date: string): Promise<Attendance[]>;
}

// ============================================================
// Competition Repository
// ============================================================
export interface CompetitionRepository {
  list(clubId: string): Promise<Competition[]>;
  getById(id: string): Promise<Competition | null>;
  create(clubId: string, input: CreateCompetitionInput): Promise<Competition>;
  update(id: string, input: UpdateCompetitionInput): Promise<Competition>;
  delete(id: string): Promise<void>;
}

// ============================================================
// Match Repository
// ============================================================
export interface MatchRepository {
  list(clubId: string, params?: MatchListParams): Promise<ListResult<Match>>;
  getById(id: string): Promise<Match | null>;
  create(clubId: string, input: CreateMatchInput): Promise<Match>;
  update(id: string, input: UpdateMatchInput): Promise<Match>;
  delete(id: string): Promise<void>;
  getResult(matchId: string): Promise<MatchResult>;
  getRecordStats(clubId: string, season?: string): Promise<MatchRecordStats>;
  getUpcoming(clubId: string): Promise<Match[]>;
  getPast(clubId: string): Promise<Match[]>;
}

// ============================================================
// Finance Repository
// ============================================================
export interface FinanceRepository {
  list(clubId: string, params?: TransactionListParams): Promise<ListResult<Transaction>>;
  getById(id: string): Promise<Transaction | null>;
  create(clubId: string, input: CreateTransactionInput): Promise<Transaction>;
  update(id: string, input: UpdateTransactionInput): Promise<Transaction>;
  delete(id: string): Promise<void>;
  getTotals(clubId: string): Promise<FinanceTotals>;
  getBalance(clubId: string): Promise<number>;
}

// ============================================================
// Notification Repository
// ============================================================
export interface NotificationRepository {
  list(clubId: string): Promise<Notification[]>;
  getById(id: string): Promise<Notification | null>;
  create(clubId: string, notification: Omit<Notification, "id" | "createdAt">): Promise<Notification>;
  markAsRead(id: string): Promise<Notification>;
  markAllAsRead(clubId: string): Promise<void>;
  delete(id: string): Promise<void>;
  getUnreadCount(clubId: string): Promise<number>;
}

// ============================================================
// Activity Repository
// ============================================================
export interface ActivityRepository {
  list(clubId: string): Promise<ActivityLog[]>;
  create(activity: Omit<ActivityLog, "id" | "createdAt">): Promise<ActivityLog>;
  getByEntity(clubId: string, entity: string, entityId: string): Promise<ActivityLog[]>;
}

// ============================================================
// Organization Repository
// ============================================================
export interface OrganizationRepository {
  getClub(clubId: string): Promise<Club | null>;
  updateClub(clubId: string, club: Partial<Club>): Promise<Club>;
  getClubs(): Promise<Club[]>;
}

// ============================================================
// Repository Container (Dependency Injection)
// ============================================================
export interface Repositories {
  player: PlayerRepository;
  staff: StaffRepository;
  team: TeamRepository;
  season: SeasonRepository;
  training: TrainingRepository;
  competition: CompetitionRepository;
  match: MatchRepository;
  finance: FinanceRepository;
  notification: NotificationRepository;
  activity: ActivityRepository;
  organization: OrganizationRepository;
}

// ============================================================
// Repository Factory
// ============================================================
export interface RepositoryFactory {
  createRepositories(clubId: string): Repositories;
}
