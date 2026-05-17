"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import { socketClient } from "@/socket/socketClient";

export function useLiveEvents() {
  const queryClient = useQueryClient();
  const pushNotification = useNotificationStore((state) => state.push);

  useEffect(() => {
    const socket = socketClient.connect();

    socket.on("standingsUpdated", () => {
      void queryClient.invalidateQueries({ queryKey: ["standings"] });
      pushNotification("Standings updated live");
    });

    socket.on("leaderboardUpdated", () => {
      void queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      pushNotification("Leaderboard recalculated");
    });

    socket.on("matchVerified", () => {
      void queryClient.invalidateQueries({ queryKey: ["match"] });
      pushNotification("Match verified. XP awarded.");
    });

    socket.on("playerQualified", () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      pushNotification("Qualification status changed");
    });

    socket.on("disputeCreated", () => {
      pushNotification("Dispute created and sent to review");
    });

    return () => {
      socket.off("standingsUpdated");
      socket.off("leaderboardUpdated");
      socket.off("matchVerified");
      socket.off("playerQualified");
      socket.off("disputeCreated");
    };
  }, [pushNotification, queryClient]);
}
