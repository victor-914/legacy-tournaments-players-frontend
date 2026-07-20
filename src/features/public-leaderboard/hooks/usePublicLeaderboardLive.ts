"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { publicSocketClient } from "@/features/public-leaderboard/socket/publicSocketClient";

export function usePublicLeaderboardLive() {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = publicSocketClient.acquire();
    setConnected(socket.connected);

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleLeaderboardUpdated = () => {
      void queryClient.invalidateQueries({ queryKey: ["public-leaderboard"] });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("leaderboardUpdated", handleLeaderboardUpdated);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("leaderboardUpdated", handleLeaderboardUpdated);
      publicSocketClient.release();
    };
  }, [queryClient]);

  return { connected };
}
