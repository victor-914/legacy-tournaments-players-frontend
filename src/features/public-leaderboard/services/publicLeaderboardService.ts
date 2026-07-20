import { publicApiClient } from "@/services/publicApiClient";
import type { ApiResponse } from "@/types/domain";
import type {
  PublicGroupLeaderboardData,
  PublicGroupSummary,
  PublicLeaderboardData,
  PublicLeaderboardParams
} from "@/features/public-leaderboard/types";

export const publicLeaderboardService = {
  async getPublicLeaderboard(params?: PublicLeaderboardParams): Promise<PublicLeaderboardData> {
    const response = await publicApiClient.get<ApiResponse<PublicLeaderboardData>>("/public/leaderboard", { params });
    return response.data.data;
  },
  async getPublicGroups(cycleId?: string): Promise<PublicGroupSummary[]> {
    const response = await publicApiClient.get<ApiResponse<PublicGroupSummary[]>>("/public/groups", {
      params: cycleId ? { cycleId } : undefined
    });
    return response.data.data;
  },
  async getPublicGroupLeaderboard(groupId: string): Promise<PublicGroupLeaderboardData> {
    const response = await publicApiClient.get<ApiResponse<PublicGroupLeaderboardData>>(`/public/groups/${groupId}/leaderboard`);
    return response.data.data;
  }
};
