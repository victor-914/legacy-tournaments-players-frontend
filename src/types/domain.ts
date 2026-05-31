export enum QualificationStatus {
  Qualified = "qualified",
  NeedsMoreXp = "needs_more_xp",
  NearQualification = "near_qualification",
  InGroupStage = "in_group_stage",
  GrandFinaleQualified = "grand_finale_qualified",
  Eliminated = "eliminated",
  AtRisk = "at_risk"
}

export enum TournamentStatus {
  Live = "live",
  WeeklyGroupStage = "weekly_group_stage",
  GrandFinale = "grand_finale",
  Completed = "completed"
}

export enum SubmissionMatchStatus {
  Scheduled = "scheduled",
  WaitingForSubmission = "waiting_for_submission",
  WaitingForOpponent = "waiting_for_opponent",
  Verifying = "verifying",
  Confirmed = "confirmed",
  Disputed = "disputed"
}

export type MatchStatus =
  | "pending"
  | "live"
  | "current"
  | "completed"
  | "played"
  | "pending_admin_approval"
  | "disputed"
  | "rejected"
  | "approved";

export type GroupMatchStatus =
  | "pending"
  | "current"
  | "live"
  | "played"
  | "pending_admin_approval"
  | "completed"
  | "disputed"
  | "cancelled";

export type GroupMatchResult = "win" | "loss" | "not_played";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Player {
  id: string;
  gamerTag: string;
  avatarUrl: string;
  rank: string;
  xp: number;
  level: number;
  winRate: number;
  streak: number;
  qualificationStatus: QualificationStatus;
}

export interface Standing {
  rank: number;
  player: Player;
  wins: number;
  losses: number;
  xp: number;
  points: number;
  qualificationStatus: QualificationStatus;
  movement: "up" | "down" | "same";
}

export interface Tournament {
  id: string;
  name: string;
  type: string;
  status: TournamentStatus;
  participants: number;
  qualificationSlots: number;
  progress: number;
  currentCycle: string;
  groupStage: string;
}

export interface Match {
  id: string;
  opponent: Player;
  tournamentName: string;
  groupName: string;
  scheduledAt: string;
  status: SubmissionMatchStatus;
  playerScore?: number;
  opponentScore?: number;
}

export interface FindMatch {
  id: string;
  opponent: Player;
  season: string;
  cycle: string;
  groupName?: string;
  status: MatchStatus;
  scheduledAt?: string;
}

export interface ScreenshotEvidence {
  id: string;
  fileName: string;
  mimeType: string;
  uploadedAt: string;
  previewUrl?: string;
}

export interface MatchScoreSubmission {
  id: string;
  matchId: string;
  playerId: string;
  playerName: string;
  myScore: number;
  opponentScore: number;
  evidence: ScreenshotEvidence | string;
  submittedAt: string;
}

export interface MatchMessage {
  id: string;
  matchId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface PastMatch {
  id: string;
  opponent: Player;
  score: string;
  result: "win" | "loss";
  status: Extract<MatchStatus, "completed" | "disputed">;
  date: string;
}

export interface LiveMatch {
  id: string;
  player: Player;
  opponent: Player;
  season: string;
  cycle: string;
  groupName?: string;
  status: MatchStatus;
  roomCode?: string;
  submissions: MatchScoreSubmission[];
  playerOneId?: string;
  playerTwoId?: string;
  playerOneScore?: number;
  playerTwoScore?: number;
  winnerId?: string;
  loserId?: string;
  resultId?: string;
  scheduledAt?: string;
}

export type MockLiveMatchStatus = "ready" | "in_progress" | "submitted" | "disputed" | "completed";

export interface MockOpponent {
  id: string;
  name: string;
  rank: string;
  level: number;
  winRate: number;
}

export interface MockLiveMatchMessage {
  id: string;
  sender: "player" | "opponent" | "system";
  senderName: string;
  message: string;
  createdAt: string;
}

export interface MockScoreSubmission {
  myScore: number;
  opponentScore: number;
  submittedAt: string;
}

export interface MockDisputeScreenshot {
  fileName: string;
  previewUrl?: string;
  uploadedAt: string;
}

export interface MockActiveLiveMatch {
  id: string;
  playerName: string;
  opponent: MockOpponent;
  currentUserSide: "A" | "B";
  status: MockLiveMatchStatus;
  groupCode?: string;
  messages: MockLiveMatchMessage[];
  scoreSubmission?: MockScoreSubmission;
  opponentSubmission?: MockScoreSubmission;
  finalScore?: string;
  result?: "win" | "loss";
  disputeScreenshot?: MockDisputeScreenshot;
  createdAt: string;
}

export interface RegisterQualificationPayload {
  fullName?: string;
  email: string;
  gameTag?: string;
  phoneNumber?: string;
  telegramUsername?: string;
  discordUsername?: string;
  currentXp?: number;
  statScreenshot: File | null;
  statScreenshotUrl?: string;
  statScreenshotKey?: string;
  statScreenshotFileName?: string;
}

export interface RegisterPasswordPayload {
  password: string;
  confirmPassword: string;
}

export type UserRole = "player" | "admin";

export interface LoginInput {
  emailAddress: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  token?: string;
  jwt?: string;
  user?: PlayerMeUser | null;
  player?: Player | PlayerMePlayer | null;
}

export interface GroupStageMatch {
  id: string;
  opponent: Player;
  status: GroupMatchStatus;
  result: GroupMatchResult;
  scheduledAt?: string;
  playerScore?: number;
  opponentScore?: number;
}

export interface PlayerGroupStage {
  isAdded: boolean;
  player: Player;
  groupName?: string;
  season?: string;
  cycle?: string;
  totalPlayers: number;
  currentMatch?: GroupStageMatch;
  matches: GroupStageMatch[];
  standings: Standing[];
}

export interface ActivityItem {
  id: string;
  type: "standing" | "match" | "qualification" | "dispute" | "xp";
  message: string;
  createdAt: string;
}

export interface DashboardSummary {
  player: Player;
  season: string;
  cycle: string;
  qualificationProgress: number;
  weeklyRank: number;
  currentGroup: string;
  upcomingMatch: Match;
  recentResults: string[];
  standings: Standing[];
  activity: ActivityItem[];
}

export interface PlayerMeUser {
  id?: string;
  fullName?: string;
  fullname?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isApproved?: boolean | string;
  approvalStatus?: string;
  status?: string;
}

export interface PlayerMePlayer {
  id?: string;
  userId?: string;
  gameTag?: string;
  gamerTag?: string;
  currentXp?: number;
  xp?: number;
  approvalStatus?: string;
  qualificationStatus?: string;
  progressionStatus?: string;
  avatarUrl?: string;
}

export interface PlayerMeSeason {
  id?: string;
  name?: string;
  code?: string;
  startDate?: string;
  endDate?: string;
}

export interface PlayerMeCycle {
  id?: string;
  name?: string;
  number?: number;
  cycleNumber?: number;
  code?: string;
  startDate?: string;
  endDate?: string;
}

export interface PlayerMeGroup {
  id?: string;
  name?: string;
  number?: number;
  groupNumber?: number;
  currentPlayers?: number;
  playerCount?: number;
  maxPlayers?: number;
  capacity?: number;
}

export interface PlayerMeMembership {
  id?: string;
  status?: string;
  approvalStatus?: string;
  qualificationStatus?: string;
  progressionStatus?: string;
}

export interface PlayerMeStanding {
  playerId?: string;
  userId?: string;
  rank?: number;
  currentRank?: number;
  points?: number;
  wins?: number;
  losses?: number;
  draws?: number;
  matchesPlayed?: number;
  scoreDifference?: number;
  scoreDiff?: number;
  progressionStatus?: string;
  qualificationStatus?: string;
}

export interface PlayerMeDashboard {
  user?: PlayerMeUser | null;
  player?: PlayerMePlayer | null;
  season?: PlayerMeSeason | null;
  cycle?: PlayerMeCycle | null;
  group?: PlayerMeGroup | null;
  membership?: PlayerMeMembership | null;
  standing?: PlayerMeStanding | null;
  currentRank?: number | null;
}

export interface MatchResultSubmitPayload {
  myScore: number;
  opponentScore: number;
  evidenceFile?: File | null;
}

export interface DisputeEvidencePayload {
  evidenceFile: File;
  note?: string;
  myScore?: number;
  opponentScore?: number;
}

export interface MatchResultRejectPayload {
  reason: string;
}

export interface GroupLeaderboardEntry extends PlayerMeStanding {
  id?: string;
  player?: PlayerMePlayer | null;
  user?: PlayerMeUser | null;
  gameTag?: string;
  gamerTag?: string;
  fullName?: string;
  xp?: number;
}
