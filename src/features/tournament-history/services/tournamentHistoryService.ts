import { apiClient } from "@/services/apiClient";
import type { UploadedStatScreenshot } from "@/services/registrationService";
import type { ApiResponse } from "@/types/domain";
import type { PlayerTournamentsResponse } from "@/features/tournament-history/types";

type ApiEnvelope<T> = ApiResponse<T> | T;

function unwrap<T>(payload: ApiEnvelope<T>): T {
  if (payload && typeof payload === "object" && "success" in payload && "data" in payload) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
}

export const tournamentHistoryService = {
  async getPlayerTournaments(): Promise<PlayerTournamentsResponse> {
    const response = await apiClient.get<ApiEnvelope<PlayerTournamentsResponse>>("/players/tournaments");
    return unwrap(response.data);
  },

  async joinActiveCycle(upload: UploadedStatScreenshot): Promise<void> {
    await apiClient.post("/players/join-active-cycle", {
      statScreenshotUrl: upload.url,
      statScreenshotKey: upload.key,
      statScreenshotFileName: upload.fileName,
      statScreenshotMimeType: upload.mimeType
    });
  }
};
