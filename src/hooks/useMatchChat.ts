"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockApi } from "@/services/mockApi";

export function useMatchChat(matchId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["match-messages", matchId] as const;

  // TODO: Replace polling/mock requests with a WebSocket channel scoped to matchId when the backend exposes it.
  const messages = useQuery({
    queryKey,
    queryFn: () => mockApi.getMatchMessages(matchId)
  });

  const sendMessage = useMutation({
    mutationFn: (message: string) => mockApi.sendMatchMessage(matchId, message),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    }
  });

  return { messages, sendMessage };
}
