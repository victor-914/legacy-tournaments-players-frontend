import {
  activity,
  dashboardSummary,
  findMatches,
  liveMatches,
  matchMessages,
  pastMatches,
  playerGroupStage,
  players,
  standings,
  tournaments,
  upcomingMatch
} from "@/constants/mockData";
import type {
  ActivityItem,
  DashboardSummary,
  FindMatch,
  LiveMatch,
  Match,
  MatchMessage,
  MatchScoreSubmission,
  PastMatch,
  Player,
  PlayerGroupStage,
  ScreenshotEvidence,
  Standing,
  Tournament
} from "@/types/domain";

const latency = 250;

const liveMatchStore = liveMatches.map((match) => ({ ...match, submissions: [...match.submissions] }));
let messageStore = [...matchMessages];

function resolveMock<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), latency);
  });
}

export const mockApi = {
  getDashboard(): Promise<DashboardSummary> {
    return resolveMock(dashboardSummary);
  },
  getTournaments(): Promise<Tournament[]> {
    return resolveMock(tournaments);
  },
  getPlayerGroupStage(): Promise<PlayerGroupStage> {
    return resolveMock(playerGroupStage);
  },
  getFindMatches(): Promise<FindMatch[]> {
    return resolveMock(findMatches);
  },
  startLiveMatch(matchId: string): Promise<LiveMatch> {
    const match = liveMatchStore.find((item) => item.id === matchId);

    if (!match) {
      return Promise.reject(new Error("Match not found"));
    }

    match.status = match.status === "pending" ? "live" : match.status;
    return resolveMock({ ...match, submissions: [...match.submissions] });
  },
  getLiveMatch(matchId: string): Promise<LiveMatch> {
    const match = liveMatchStore.find((item) => item.id === matchId);

    if (!match) {
      return Promise.reject(new Error("Match not found"));
    }

    return resolveMock({ ...match, submissions: [...match.submissions] });
  },
  createRoomCode(matchId: string): Promise<string> {
    const match = liveMatchStore.find((item) => item.id === matchId);

    if (!match) {
      return Promise.reject(new Error("Match not found"));
    }

    match.roomCode = match.roomCode ?? `LEG-${matchId.slice(-4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    return resolveMock(match.roomCode);
  },
  getMatchMessages(matchId: string): Promise<MatchMessage[]> {
    return resolveMock(messageStore.filter((message) => message.matchId === matchId));
  },
  sendMatchMessage(matchId: string, message: string): Promise<MatchMessage> {
    const match = liveMatchStore.find((item) => item.id === matchId);

    if (!match) {
      return Promise.reject(new Error("Match not found"));
    }

    const nextMessage: MatchMessage = {
      id: `msg-${Date.now()}`,
      matchId,
      senderId: match.player.id,
      senderName: match.player.gamerTag,
      message,
      createdAt: new Date().toISOString()
    };

    messageStore = [...messageStore, nextMessage];
    return resolveMock(nextMessage);
  },
  submitMatchScore(
    matchId: string,
    payload: {
      myScore: number;
      opponentScore: number;
      evidence: Pick<ScreenshotEvidence, "fileName" | "mimeType" | "previewUrl">;
      submitterId?: string;
    }
  ): Promise<LiveMatch> {
    const match = liveMatchStore.find((item) => item.id === matchId);

    if (!match) {
      return Promise.reject(new Error("Match not found"));
    }

    const submitter = payload.submitterId === match.opponent.id ? match.opponent : match.player;
    const submission: MatchScoreSubmission = {
      id: `sub-${Date.now()}`,
      matchId,
      playerId: submitter.id,
      playerName: submitter.gamerTag,
      myScore: payload.myScore,
      opponentScore: payload.opponentScore,
      evidence: {
        id: `evidence-${Date.now()}`,
        fileName: payload.evidence.fileName,
        mimeType: payload.evidence.mimeType,
        previewUrl: payload.evidence.previewUrl,
        uploadedAt: new Date().toISOString()
      },
      submittedAt: new Date().toISOString()
    };

    const opponentSubmission = match.submissions.find((item) => item.playerId !== submitter.id);
    match.submissions = [...match.submissions.filter((item) => item.playerId !== submitter.id), submission];

    if (opponentSubmission) {
      const submissionsMatch =
        opponentSubmission.myScore === submission.opponentScore &&
        opponentSubmission.opponentScore === submission.myScore;

      if (submissionsMatch) {
        match.status = "completed";
        const opponent = submitter.id === match.player.id ? match.opponent : match.player;
        match.winnerId = submission.myScore > submission.opponentScore ? submitter.id : opponent.id;
        match.loserId = submission.myScore > submission.opponentScore ? opponent.id : submitter.id;
      } else {
        match.status = "disputed";
      }
    }

    return resolveMock({ ...match, submissions: [...match.submissions] });
  },
  getPastMatches(): Promise<PastMatch[]> {
    return resolveMock(pastMatches);
  },
  getTournament(id: string): Promise<Tournament> {
    return resolveMock(tournaments.find((tournament) => tournament.id === id) ?? tournaments[0]);
  },
  getStandings(): Promise<Standing[]> {
    return resolveMock(standings);
  },
  getLeaderboard(): Promise<Standing[]> {
    return resolveMock([...standings].sort((a, b) => b.xp - a.xp));
  },
  getActivity(): Promise<ActivityItem[]> {
    return resolveMock(activity);
  },
  getMatch(): Promise<Match> {
    return resolveMock(upcomingMatch);
  },
  getProfile(): Promise<Player> {
    return resolveMock(players[0]);
  }
};
