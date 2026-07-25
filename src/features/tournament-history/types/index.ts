export interface TournamentPrize {
  description?: string;
  value?: number;
  currency?: string;
}

export interface TournamentPrizeWon extends TournamentPrize {
  awardedAt?: string;
}

export interface ActiveTournamentEntry {
  cycleId: string;
  cycleName: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  prize: TournamentPrize | null;
  approvalStatus: string;
  currentRank: number;
  qualificationStatus: string;
}

export interface PastTournamentEntry {
  cycleId: string;
  cycleName: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  currentRank: number;
  qualificationStatus: string;
  prizeWon: TournamentPrizeWon | null;
}

export interface PlayerTournamentsResponse {
  activeCycle: ActiveTournamentEntry | null;
  history: PastTournamentEntry[];
}
