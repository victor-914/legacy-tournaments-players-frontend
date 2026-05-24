"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockApi } from "@/services/mockApi";
import { socketClient } from "@/socket/socketClient";
import type { MatchMessage } from "@/types/domain";

type MatchMessagePayload = MatchMessage | {
  matchId?: string;
  message?: MatchMessage;
};

export function useMatchChat(matchId: string) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["match-messages", matchId] as const, [matchId]);

  const messages = useQuery({
    queryKey,
    queryFn: () => mockApi.getMatchMessages(matchId)
  });

  useEffect(() => {
    const socket = socketClient.connect();
    const handleMessageCreated = (payload: MatchMessagePayload) => {
      const nestedMessage = typeof payload.message === "object" ? payload.message : undefined;
      const nextMessage = nestedMessage ?? (payload as MatchMessage);
      const payloadMatchId = payload.matchId ?? nestedMessage?.matchId;

      if (!nextMessage || payloadMatchId !== matchId) {
        return;
      }

      queryClient.setQueryData<MatchMessage[]>(queryKey, (current = []) => {
        if (current.some((message) => message.id === nextMessage.id)) {
          return current;
        }

        return [...current, nextMessage];
      });
      void queryClient.invalidateQueries({ queryKey });
    };

    socket.emit("joinMatch", { matchId });
    socket.on("matchMessageCreated", handleMessageCreated);

    return () => {
      socket.emit("leaveMatch", { matchId });
      socket.off("matchMessageCreated", handleMessageCreated);
    };
  }, [matchId, queryClient, queryKey]);

  const sendMessage = useMutation({
    mutationFn: (message: string) => mockApi.sendMatchMessage(matchId, message),
    onSuccess: (createdMessage) => {
      queryClient.setQueryData<MatchMessage[]>(queryKey, (current = []) => {
        if (current.some((message) => message.id === createdMessage.id)) {
          return current;
        }

        return [...current, createdMessage];
      });
      void queryClient.invalidateQueries({ queryKey });
    }
  });

  return { messages, sendMessage };
}
