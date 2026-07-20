"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { publicSocketClient } from "@/features/public-leaderboard/socket/publicSocketClient";

interface StandingsUpdatedPayload {
  groupId?: string;
}

export function usePublicGroupLeaderboardLive(groupId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!groupId) {
      return;
    }

    const socket = publicSocketClient.acquire();

    const handleStandingsUpdated = (payload?: StandingsUpdatedPayload) => {
      if (payload?.groupId === groupId) {
        void queryClient.invalidateQueries({ queryKey: ["public-group-leaderboard", groupId] });
      }
    };

    socket.on("standingsUpdated", handleStandingsUpdated);
    socket.emit("subscribeGroupLeaderboard", { groupId });

    return () => {
      socket.off("standingsUpdated", handleStandingsUpdated);
      socket.emit("unsubscribeGroupLeaderboard", { groupId });
      publicSocketClient.release();
    };
  }, [groupId, queryClient]);
}
