"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import { socketClient } from "@/socket/socketClient";

type MatchEventPayload = {
  matchId?: string;
  match?: { id?: string };
};

export function useLiveEvents() {
  const queryClient = useQueryClient();
  const pushNotification = useNotificationStore((state) => state.push);

  useEffect(() => {
    const socket = socketClient.connect();
    const invalidateMatchQueries = (payload?: MatchEventPayload) => {
      const matchId = payload?.matchId ?? payload?.match?.id;

      void queryClient.invalidateQueries({ queryKey: ["find-matches"] });
      void queryClient.invalidateQueries({ queryKey: ["player-group-stage"] });
      void queryClient.invalidateQueries({ queryKey: ["players-me"] });
      void queryClient.invalidateQueries({ queryKey: ["group-leaderboard"] });
      void queryClient.invalidateQueries({ queryKey: ["past-matches"] });

      if (matchId) {
        void queryClient.invalidateQueries({ queryKey: ["live-match", matchId] });
      }
    };
    const invalidateMessageQueries = (payload?: MatchEventPayload) => {
      const matchId = payload?.matchId ?? payload?.match?.id;
      invalidateMatchQueries(payload);

      if (matchId) {
        void queryClient.invalidateQueries({ queryKey: ["match-messages", matchId] });
      }
    };
    const handleMatchDisputed = (payload?: MatchEventPayload) => {
      invalidateMatchQueries(payload);
      pushNotification("Match disputed. Admin review required.");
    };

    socket.on("standingsUpdated", () => {
      void queryClient.invalidateQueries({ queryKey: ["standings"] });
      void queryClient.invalidateQueries({ queryKey: ["players-me"] });
      void queryClient.invalidateQueries({ queryKey: ["player-group-stage"] });
      void queryClient.invalidateQueries({ queryKey: ["group-leaderboard"] });
      pushNotification("Standings updated live");
    });

    socket.on("leaderboardUpdated", () => {
      void queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      pushNotification("Leaderboard recalculated");
    });

    socket.on("matchVerified", (payload?: MatchEventPayload) => {
      invalidateMatchQueries(payload);
      void queryClient.invalidateQueries({ queryKey: ["standings"] });
      pushNotification("Match verified. XP awarded.");
    });

    socket.on("playerQualified", () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      pushNotification("Qualification status changed");
    });

    socket.on("disputeCreated", () => {
      pushNotification("Dispute created and sent to review");
    });

    socket.on("matchFound", invalidateMatchQueries);
    socket.on("matchStarted", invalidateMatchQueries);
    socket.on("matchUpdated", invalidateMatchQueries);
    socket.on("roomCodeCreated", invalidateMatchQueries);
    socket.on("scoreSubmitted", invalidateMatchQueries);
    socket.on("matchCompleted", invalidateMatchQueries);
    socket.on("matchDisputed", handleMatchDisputed);
    socket.on("matchMessageCreated", invalidateMessageQueries);

    return () => {
      socket.off("standingsUpdated");
      socket.off("leaderboardUpdated");
      socket.off("matchVerified");
      socket.off("playerQualified");
      socket.off("disputeCreated");
      socket.off("matchFound", invalidateMatchQueries);
      socket.off("matchStarted", invalidateMatchQueries);
      socket.off("matchUpdated", invalidateMatchQueries);
      socket.off("roomCodeCreated", invalidateMatchQueries);
      socket.off("scoreSubmitted", invalidateMatchQueries);
      socket.off("matchCompleted", invalidateMatchQueries);
      socket.off("matchDisputed", handleMatchDisputed);
      socket.off("matchMessageCreated", invalidateMessageQueries);
    };
  }, [pushNotification, queryClient]);
}
