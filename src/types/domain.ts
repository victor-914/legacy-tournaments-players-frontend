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

export enum MatchStatus {
  Scheduled = "scheduled",
  WaitingForSubmission = "waiting_for_submission",
  WaitingForOpponent = "waiting_for_opponent",
  Verifying = "verifying",
  Confirmed = "confirmed",
  Disputed = "disputed"
}

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
  status: MatchStatus;
  playerScore?: number;
  opponentScore?: number;
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
