export interface PlayerTournamentCycleSummary {
  id: string;
  name?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  prize?: string | number | null;
}

export interface PlayerTournamentEntry {
  cycle: PlayerTournamentCycleSummary;
  approvalStatus?: string;
  qualificationStatus?: string;
  rank?: number;
  groupName?: string;
  finalPlacement?: number;
  prizeWon?: string | number | null;
}

export interface PlayerTournamentsResponse {
  activeCycle: PlayerTournamentEntry | null;
  pastCycles: PlayerTournamentEntry[];
}

export interface JoinActiveCyclePayload {
  statScreenshotUrl: string;
  statScreenshotKey: string;
  statScreenshotFileName: string;
  statScreenshotMimeType: string;
}
