import type { QualificationStatus } from "@/types/domain";

export interface PublicLeaderboardEntry {
  rank: number;
  playerId: string;
  gamerTag: string;
  avatarUrl?: string;
  wins: number;
  losses: number;
  xp: number;
  points: number;
  qualificationStatus: QualificationStatus;
}

export interface PublicLeaderboardData {
  entries: PublicLeaderboardEntry[];
  page: number;
  limit: number;
  total: number;
  seasonId: string;
  seasonName: string;
  generatedAt: string;
}

export interface PublicLeaderboardParams {
  page?: number;
  limit?: number;
}

export interface PublicGroupSummary {
  id: string;
  name: string;
  groupNumber: number;
}

export interface PublicGroupLeaderboardEntry {
  id: string;
  playerId: string;
  rank: number;
  gamerTag: string;
  avatarUrl?: string;
  xp: number;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  matchesPlayed: number;
  scoreFor: number;
  scoreAgainst: number;
  scoreDifference: number;
  progressionStatus: string;
  qualificationStatus: QualificationStatus;
}

export interface PublicGroupLeaderboardData {
  groupId: string;
  groupName: string;
  entries: PublicGroupLeaderboardEntry[];
}
