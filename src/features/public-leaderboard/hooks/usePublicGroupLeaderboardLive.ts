"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { publicSocketClient } from "@/features/public-leaderboard/socket/publicSocketClient";

interface StandingsUpdatedPayload {
  groupId?: string;
}

export function usePublicGroupLeaderboardLive(groupId: string | null, enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // A completed cycle's standings never change again, so skip subscribing entirely
    // when viewing a past cycle's group — no point holding a live socket room for it.
    if (!groupId || !enabled) {
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
  }, [groupId, enabled, queryClient]);
}
