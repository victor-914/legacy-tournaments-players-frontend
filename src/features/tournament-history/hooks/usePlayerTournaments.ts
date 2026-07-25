"use client";

import { useQuery } from "@tanstack/react-query";
import { tournamentHistoryService } from "@/features/tournament-history/services/tournamentHistoryService";

export const playerTournamentsQueryKey = ["player-tournaments"] as const;

export function usePlayerTournaments(enabled: boolean) {
  return useQuery({
    queryKey: playerTournamentsQueryKey,
    queryFn: tournamentHistoryService.getPlayerTournaments,
    enabled
  });
}
