import { apiClient } from "@/services/apiClient";
import { publicApiClient } from "@/services/publicApiClient";
import type { ApiResponse } from "@/types/domain";
import type {
  ChampionshipBracket,
  ChampionshipState,
  GroupChatData,
  GroupChatMessage,
  MyFixturesData
} from "@/features/championship/types";

export const championshipQueryKeys = {
  current: ["championship", "current"] as const,
  bracket: (cycleId: string) => ["championship", cycleId, "bracket"] as const,
  myFixtures: ["championship", "my-fixtures"] as const,
  groupChat: (groupId: string) => ["championship", "group-chat", groupId] as const
};

export const championshipService = {
  async getCurrent(): Promise<ChampionshipState | null> {
    const response = await publicApiClient.get<ApiResponse<ChampionshipState | null>>("/public/knockout/current");
    return response.data.data ?? null;
  },
  async getBracket(cycleId: string): Promise<ChampionshipBracket> {
    const response = await publicApiClient.get<ApiResponse<ChampionshipBracket>>(`/public/knockout/${cycleId}/bracket`);
    return response.data.data;
  },
  async getMyFixtures(): Promise<MyFixturesData | null> {
    const response = await apiClient.get<ApiResponse<MyFixturesData | null>>("/knockout/my-fixtures");
    return response.data.data ?? null;
  },
  async getGroupChat(groupId: string): Promise<GroupChatData> {
    const response = await apiClient.get<ApiResponse<GroupChatData>>(`/knockout/groups/${groupId}/chat`, {
      params: { limit: 100 }
    });
    return response.data.data;
  },
  async postGroupChat(groupId: string, message: string): Promise<GroupChatMessage> {
    const response = await apiClient.post<ApiResponse<GroupChatMessage>>(`/knockout/groups/${groupId}/chat`, { message });
    return response.data.data;
  }
};
