"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { publicSocketClient } from "@/features/public-leaderboard/socket/publicSocketClient";
import { socketClient } from "@/socket/socketClient";
import { championshipQueryKeys, championshipService } from "@/features/championship/services/championshipService";
import type { ChampionshipState, GroupChatData, GroupChatMessage } from "@/features/championship/types";

// Current knockout cycle's public draw state. Live picks arrive as full state
// snapshots over the /public socket and are written straight into the cache
// so the reveal animates without a refetch.
export function useChampionshipState() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: championshipQueryKeys.current,
    queryFn: championshipService.getCurrent,
    staleTime: 15_000
  });
  const cycleId = query.data?.cycleId;

  useEffect(() => {
    if (!cycleId) return;
    const socket = publicSocketClient.acquire();
    const subscribe = () => socket.emit("subscribeKnockout", { cycleId });
    const onState = (payload: { cycleId: string; state: ChampionshipState }) => {
      if (payload.cycleId === cycleId && payload.state) {
        queryClient.setQueryData(championshipQueryKeys.current, payload.state);
      }
    };
    subscribe();
    socket.on("connect", subscribe);
    socket.on("knockout:draw_updated", onState);
    socket.on("knockout:pick", onState);
    return () => {
      socket.emit("unsubscribeKnockout", { cycleId });
      socket.off("connect", subscribe);
      socket.off("knockout:draw_updated", onState);
      socket.off("knockout:pick", onState);
      publicSocketClient.release();
    };
  }, [cycleId, queryClient]);

  return query;
}

export function useChampionshipBracket(cycleId: string | undefined) {
  return useQuery({
    queryKey: championshipQueryKeys.bracket(cycleId ?? "none"),
    queryFn: () => championshipService.getBracket(cycleId as string),
    enabled: Boolean(cycleId),
    staleTime: 30_000
  });
}

export function useMyFixtures(enabled = true) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: championshipQueryKeys.myFixtures,
    queryFn: championshipService.getMyFixtures,
    enabled
  });

  useEffect(() => {
    if (!enabled) return;
    const socket = socketClient.connect();
    const refresh = () => void queryClient.invalidateQueries({ queryKey: championshipQueryKeys.myFixtures });
    socket.on("fixture:assigned", refresh);
    socket.on("matchVerified", refresh);
    return () => {
      socket.off("fixture:assigned", refresh);
      socket.off("matchVerified", refresh);
    };
  }, [enabled, queryClient]);

  return query;
}

const upsert = (data: GroupChatData | undefined, message: GroupChatMessage): GroupChatData | undefined => {
  if (!data) return data;
  const exists = data.messages.some((item) => item.id === message.id);
  const messages = exists ? data.messages.map((item) => (item.id === message.id ? message : item)) : [...data.messages, message];
  const pinned =
    message.pinned && !message.deleted
      ? [message, ...data.pinned.filter((item) => item.id !== message.id)]
      : data.pinned.filter((item) => item.id !== message.id);
  return { ...data, messages, pinned };
};

export function useGroupChat(groupId: string | undefined, myUserId?: string) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => championshipQueryKeys.groupChat(groupId ?? "none"), [groupId]);
  const query = useQuery({
    queryKey,
    queryFn: () => championshipService.getGroupChat(groupId as string),
    enabled: Boolean(groupId)
  });

  useEffect(() => {
    if (!groupId) return;
    const socket = socketClient.connect();
    const join = () => socket.emit("joinGroupChat", { groupId });
    const onMessage = (payload: { groupId: string; message: GroupChatMessage }) => {
      if (payload.groupId === groupId) {
        queryClient.setQueryData<GroupChatData>(queryKey, (current) => upsert(current, payload.message));
      }
    };
    const onMuted = (payload: { groupId: string; userId: string }) => {
      if (payload.groupId === groupId && (!myUserId || payload.userId === myUserId)) {
        void queryClient.invalidateQueries({ queryKey });
      }
    };
    join();
    socket.on("connect", join);
    socket.on("group_chat:message", onMessage);
    socket.on("group_chat:updated", onMessage);
    socket.on("group_chat:muted", onMuted);
    return () => {
      socket.emit("leaveGroupChat", { groupId });
      socket.off("connect", join);
      socket.off("group_chat:message", onMessage);
      socket.off("group_chat:updated", onMessage);
      socket.off("group_chat:muted", onMuted);
    };
  }, [groupId, myUserId, queryClient, queryKey]);

  const send = useMutation({
    mutationFn: (message: string) => championshipService.postGroupChat(groupId as string, message),
    onSuccess: (message) => queryClient.setQueryData<GroupChatData>(queryKey, (current) => upsert(current, message))
  });

  return { query, send };
}
