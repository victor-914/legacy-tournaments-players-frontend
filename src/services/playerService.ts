import { apiClient } from "@/services/apiClient";
import type { ApiResponse, GroupLeaderboardEntry, PlayerMeDashboard } from "@/types/domain";

type ApiEnvelope<T> = ApiResponse<T> | T;

function unwrap<T>(payload: ApiEnvelope<T>): T {
  if (payload && typeof payload === "object" && "success" in payload && "data" in payload) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
}

function normalizeLeaderboard(payload: GroupLeaderboardEntry[] | { leaderboard?: GroupLeaderboardEntry[]; standings?: GroupLeaderboardEntry[] }) {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.leaderboard ?? payload.standings ?? [];
}

export const playerService = {
  async getMe(): Promise<PlayerMeDashboard> {
    const response = await apiClient.get<ApiEnvelope<PlayerMeDashboard>>("/players/me");
    console.log("🚀 ~ response:", response)
    return unwrap(response.data);
  },

  async getGroupLeaderboard(groupId: string): Promise<GroupLeaderboardEntry[]> {
    const response = await apiClient.get<
      ApiEnvelope<GroupLeaderboardEntry[] | { leaderboard?: GroupLeaderboardEntry[]; standings?: GroupLeaderboardEntry[] }>
    >(`/groups/${groupId}/leaderboard`);

    return normalizeLeaderboard(unwrap(response.data));
  }
};
