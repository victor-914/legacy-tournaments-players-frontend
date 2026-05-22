import { apiClient } from "@/services/apiClient";
import type {
  ActivityItem,
  ApiResponse,
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

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export const mockApi = {
  async getDashboard(): Promise<DashboardSummary> {
    return unwrap(await apiClient.get<ApiResponse<DashboardSummary>>("/dashboard"));
  },
  async getTournaments(): Promise<Tournament[]> {
    return unwrap(await apiClient.get<ApiResponse<Tournament[]>>("/tournaments"));
  },
  async getPlayerGroupStage(): Promise<PlayerGroupStage> {
    return unwrap(await apiClient.get<ApiResponse<PlayerGroupStage>>("/group-stage/me"));
  },
  async getFindMatches(): Promise<FindMatch[]> {
    return unwrap(await apiClient.get<ApiResponse<FindMatch[]>>("/matches/find"));
  },
  async startLiveMatch(matchId: string): Promise<LiveMatch> {
    return unwrap(await apiClient.post<ApiResponse<LiveMatch>>(`/matches/${matchId}/start`));
  },
  async getLiveMatch(matchId: string): Promise<LiveMatch> {
    return unwrap(await apiClient.get<ApiResponse<LiveMatch>>(`/matches/${matchId}/live`));
  },
  async createRoomCode(matchId: string): Promise<string> {
    const data = unwrap(await apiClient.post<ApiResponse<{ roomCode: string } | string>>(`/matches/${matchId}/room-code`));
    return typeof data === "string" ? data : data.roomCode;
  },
  async getMatchMessages(matchId: string): Promise<MatchMessage[]> {
    return unwrap(await apiClient.get<ApiResponse<MatchMessage[]>>(`/matches/${matchId}/messages`));
  },
  async sendMatchMessage(matchId: string, message: string): Promise<MatchMessage> {
    return unwrap(await apiClient.post<ApiResponse<MatchMessage>>(`/matches/${matchId}/messages`, { message }));
  },
  async submitMatchScore(
    matchId: string,
    payload: {
      myScore: number;
      opponentScore: number;
      evidence: Pick<ScreenshotEvidence, "fileName" | "mimeType" | "previewUrl"> & { file?: File };
      submitterId?: string;
    }
  ): Promise<LiveMatch> {
    const formData = new FormData();
    formData.append("myScore", String(payload.myScore));
    formData.append("opponentScore", String(payload.opponentScore));
    if (payload.evidence.file) {
      formData.append("evidence", payload.evidence.file);
    }

    return unwrap(
      await apiClient.post<ApiResponse<LiveMatch>>(`/matches/${matchId}/submit-score`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
    );
  },
  async getPastMatches(): Promise<PastMatch[]> {
    return unwrap(await apiClient.get<ApiResponse<PastMatch[]>>("/matches/past"));
  },
  async getTournament(id: string): Promise<Tournament> {
    return unwrap(await apiClient.get<ApiResponse<Tournament>>(`/tournaments/${id}`));
  },
  async getStandings(): Promise<Standing[]> {
    return unwrap(await apiClient.get<ApiResponse<Standing[]>>("/standings"));
  },
  async getLeaderboard(): Promise<Standing[]> {
    return unwrap(await apiClient.get<ApiResponse<Standing[]>>("/leaderboard"));
  },
  async getActivity(): Promise<ActivityItem[]> {
    return unwrap(await apiClient.get<ApiResponse<ActivityItem[]>>("/activity"));
  },
  async getMatch(): Promise<Match> {
    return unwrap(await apiClient.get<ApiResponse<Match>>("/matches/upcoming"));
  },
  async getProfile(): Promise<Player> {
    return unwrap(await apiClient.get<ApiResponse<Player>>("/auth/me"));
  }
};
