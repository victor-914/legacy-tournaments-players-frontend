"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Socket } from "socket.io-client";
import { AlertCircle, CheckCircle2, Radar, XCircle } from "lucide-react";
import styled, { keyframes } from "styled-components";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PageStack } from "@/components/ui/PagePrimitives";
import { mockApi } from "@/services/mockApi";
import { socketClient } from "@/socket/socketClient";
import type { FindMatch } from "@/types/domain";

type FindMatchState = "idle" | "connecting" | "searching" | "found" | "error";
type MatchmakingAck = {
  success?: boolean;
  error?: string;
  message?: string;
  code?: string;
  data?: {
    matchId?: string | null;
    playerId?: string;
    cycleId?: string;
  };
};
type MatchFoundPayload = {
  matchId?: string;
  match?: { id?: string };
};

function getMatchmakingMessage(response?: MatchmakingAck): string {
  if (response?.message) {
    return response.message;
  }

  switch (response?.code) {
    case "WAITING_FOR_OPPONENT":
      return "You are in the queue. Waiting for another eligible player.";
    case "PAIR_ALREADY_MATCHED":
      return "The available player is already assigned to you in this cycle. Waiting for a different opponent.";
    case "OPPONENT_NOT_ELIGIBLE":
      return "The available player is not eligible for a new match right now. Waiting for another opponent.";
    case "NO_ELIGIBLE_OPPONENT":
      return "No eligible opponent is available yet. Keep searching.";
    case "LOCK_BUSY":
      return "Matchmaking is already processing this request. Please wait.";
    case "MATCH_CREATE_FAILED":
      return "A match was found, but the server could not create it.";
    case "FIND_MATCH_FAILED":
      return "Could not start matchmaking.";
    default:
      return "Searching for an eligible opponent.";
  }
}

export function FindMatchView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [state, setState] = useState<FindMatchState>("idle");
  const [matches, setMatches] = useState<FindMatch[]>([]);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const [searchMessage, setSearchMessage] = useState("Scanning active Legacy players");
  const socketRef = useRef<Socket | null>(null);
  const findMatches = useQuery({
    queryKey: ["find-matches"],
    queryFn: mockApi.getFindMatches,
    enabled: false
  });
  const refetchFindMatchesRef = useRef(findMatches.refetch);

  useEffect(() => {
    refetchFindMatchesRef.current = findMatches.refetch;
  }, [findMatches.refetch]);

  const refreshMatchQueries = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["find-matches"] });
    void queryClient.invalidateQueries({ queryKey: ["player-group-stage"] });
    void queryClient.invalidateQueries({ queryKey: ["players-me"] });
  }, [queryClient]);

  const loadFoundMatches = useCallback(async (payload?: MatchFoundPayload) => {
    console.log("[matchmaking:client] matchFound event received", payload);
    refreshMatchQueries();

    const matchId = payload?.matchId ?? payload?.match?.id;
    if (matchId) {
      console.log("[matchmaking:client] navigating to live match from matchFound", { matchId });
      router.push(`/matches/${matchId}/live`);
      return;
    }

    try {
      console.log("[matchmaking:client] refetching find-matches after matchFound");
      const result = await refetchFindMatchesRef.current();
      if (result.isError) {
        console.log("[matchmaking:client] find-matches refetch failed after matchFound", {
          error: result.error
        });
        setFailureMessage("Match found, but match details could not be loaded.");
        setState("error");
        return;
      }

      console.log("[matchmaking:client] find-matches refetch complete", {
        count: result.data?.length ?? 0,
        matches: result.data
      });
      setMatches(result.data ?? []);
      setState("found");
    } catch (error) {
      console.log("[matchmaking:client] find-matches refetch threw after matchFound", { error });
      setFailureMessage("Match found, but match details could not be loaded.");
      setState("error");
    }
  }, [refreshMatchQueries, router]);

  const handleSearching = useCallback(() => {
    console.log("[matchmaking:client] matchmakingSearching event received");
    setSearchMessage("Scanning active Legacy players");
    setState("searching");
  }, []);

  const handleCancelled = useCallback(() => {
    console.log("[matchmaking:client] matchmakingCancelled event received");
    setFailureMessage(null);
    setSearchMessage("Scanning active Legacy players");
    setMatches([]);
    setState("idle");
  }, []);

  const handleSocketError = useCallback((payload?: { message?: string; error?: string } | string) => {
    console.log("[matchmaking:client] socketError event received", payload);
    const message = typeof payload === "string" ? payload : payload?.message ?? payload?.error;
    setFailureMessage(message ?? "Matchmaking failed. Please try again.");
    setState("error");
  }, []);

  const detachMatchmakingListeners = useCallback((socket: Socket) => {
    socket.off("matchmakingSearching", handleSearching);
    socket.off("matchmakingCancelled", handleCancelled);
    socket.off("matchFound", loadFoundMatches);
    socket.off("socketError", handleSocketError);
  }, [handleCancelled, handleSearching, handleSocketError, loadFoundMatches]);

  const attachMatchmakingListeners = useCallback((socket: Socket) => {
    detachMatchmakingListeners(socket);
    socket.on("matchmakingSearching", handleSearching);
    socket.on("matchmakingCancelled", handleCancelled);
    socket.on("matchFound", loadFoundMatches);
    socket.on("socketError", handleSocketError);
  }, [detachMatchmakingListeners, handleCancelled, handleSearching, handleSocketError, loadFoundMatches]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        detachMatchmakingListeners(socketRef.current);
      }
    };
  }, [detachMatchmakingListeners]);

  function startSearch() {
    const socket = socketClient.connect();
    socketRef.current = socket;
    attachMatchmakingListeners(socket);

    console.log("[matchmaking:client] findMatch emit starting", {
      socketId: socket.id,
      connected: socket.connected
    });

    setFailureMessage(null);
    setSearchMessage("Contacting matchmaking server");
    setMatches([]);
    setState("connecting");

    socket.timeout(8_000).emit("findMatch", {}, (error: Error | null, response?: MatchmakingAck) => {
      console.log("[matchmaking:client] findMatch ack received", {
        timedOut: Boolean(error),
        error,
        response,
        socketId: socket.id,
        connected: socket.connected
      });

      if (error) {
        setFailureMessage("Matchmaking server did not acknowledge your request. Check the socket server and try again.");
        setState("error");
        return;
      }

      if (response?.success === false) {
        setFailureMessage(response.error ?? getMatchmakingMessage(response));
        setState("error");
        return;
      }

      const matchId = response?.data?.matchId;
      if (matchId) {
        router.push(`/matches/${matchId}/live`);
        return;
      }

      setSearchMessage(getMatchmakingMessage(response));
      setState("searching");
    });
  }

  function cancelSearch() {
    const socket = socketRef.current;
    if (socket) {
      console.log("[matchmaking:client] cancelFindMatch emit", {
        socketId: socket.id,
        connected: socket.connected
      });
      socket.emit("cancelFindMatch");
    }

    handleCancelled();
  }

  function acceptMatch(match: FindMatch) {
    router.push(`/matches/${match.id}/live`);
  }

  return (
    <FindMatchShell>
      {state === "idle" || state === "error" ? (
        <CenterStage>
          <RadarButton type="button" onClick={startSearch} aria-label="Find Match">
            <RadarSweep />
            {state === "error" ? <AlertCircle size={46} /> : <Radar size={46} />}
            <strong>{state === "error" ? "Try Again" : "Find Match"}</strong>
          </RadarButton>
          <h1>{state === "error" ? "Search Failed" : "Find Match"}</h1>
          <p>{state === "error" ? failureMessage : "Search for your next opponent"}</p>
        </CenterStage>
      ) : null}

      {state === "connecting" || state === "searching" ? (
        <CenterStage>
          <RadarButton type="button" disabled aria-label="Searching for opponent">
            <RadarSweep $active />
            <PulseRing />
            <Radar size={46} />
            <strong>{state === "connecting" ? "Finding" : "Searching"}</strong>
          </RadarButton>
          <h1>{state === "connecting" ? "Starting search..." : "Searching for opponent..."}</h1>
          <p>{state === "connecting" ? "Contacting matchmaking server" : searchMessage}</p>
          <CancelButton type="button" onClick={cancelSearch}>
            <XCircle size={18} />
            Cancel
          </CancelButton>
        </CenterStage>
      ) : null}

      {state === "found" ? (
        <PageStack>
          <FoundHeader>
            <CheckCircle2 size={26} />
            <div>
              <h1>Match Found</h1>
              <p>Select an opponent to start a live match.</p>
            </div>
          </FoundHeader>
          <OpponentGrid>
            {matches.map((match) => (
              <OpponentCard key={match.id}>
                <CardBody>
                  <CardHeader>
                    <div>
                      <span>Ready</span>
                      <h2>{match.opponent.gamerTag}</h2>
                    </div>
                    <ReadyPill>Ready</ReadyPill>
                  </CardHeader>
                  <Stats>
                    <Stat>
                      <span>Rank</span>
                      <strong>{match.opponent.rank}</strong>
                    </Stat>
                    <Stat>
                      <span>Level</span>
                      <strong>{match.opponent.level}</strong>
                    </Stat>
                    <Stat>
                      <span>Win rate</span>
                      <strong>{match.opponent.winRate}%</strong>
                    </Stat>
                  </Stats>
                  <Button type="button" fullWidth onClick={() => void acceptMatch(match)}>Open Match</Button>
                </CardBody>
              </OpponentCard>
            ))}
            {!matches.length ? (
              <Card>
                <CardBody>
                  <p>No available opponents right now.</p>
                </CardBody>
              </Card>
            ) : null}
          </OpponentGrid>
        </PageStack>
      ) : null}
    </FindMatchShell>
  );
}

const sweep = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(0.78);
    opacity: 0.72;
  }

  100% {
    transform: scale(1.2);
    opacity: 0;
  }
`;

const FindMatchShell = styled.div`
  min-height: calc(100vh - 9rem);
  display: grid;
  align-items: center;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
`;

const CenterStage = styled.div`
  display: grid;
  justify-items: center;
  gap: 0.85rem;
  text-align: center;

  h1 {
    margin: 0.4rem 0 0;
    font-size: clamp(2rem, 10vw, 4.6rem);
    line-height: 0.95;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const RadarButton = styled.button`
  position: relative;
  isolation: isolate;
  width: min(72vw, 18rem);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  gap: 0.5rem;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 999px;
  background:
    radial-gradient(circle at center, rgba(212, 175, 55, 0.22), transparent 34%),
    repeating-radial-gradient(circle at center, rgba(212, 175, 55, 0.16) 0 1px, transparent 1px 2.6rem),
    #0b0b0b;
  color: ${({ theme }) => theme.colors.gold};
  box-shadow: ${({ theme }) => theme.shadows.glowGold};
  cursor: pointer;

  svg,
  strong {
    position: relative;
    z-index: 2;
  }

  strong {
    font-size: 1.1rem;
    text-transform: uppercase;
  }

  &:disabled {
    cursor: wait;
  }
`;

const RadarSweep = styled.span<{ $active?: boolean }>`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: conic-gradient(from 0deg, rgba(212, 175, 55, 0.42), transparent 26%, transparent);
  opacity: 0.7;
  animation: ${sweep} ${({ $active }) => ($active ? "1.15s" : "3.5s")} linear infinite;
`;

const CancelButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
`;

const PulseRing = styled.span`
  position: absolute;
  inset: 18%;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 999px;
  animation: ${pulse} 1.2s ease-out infinite;
`;

const FoundHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;

  svg {
    color: ${({ theme }) => theme.colors.gold};
  }

  h1,
  p {
    margin: 0;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const OpponentGrid = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const OpponentCard = styled(Card)`
  border-radius: 8px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  span {
    color: ${({ theme }) => theme.colors.gold};
    font-size: 0.74rem;
    font-weight: 900;
    text-transform: uppercase;
  }

  h2 {
    margin: 0.25rem 0 0;
  }
`;

const ReadyPill = styled.span`
  display: inline-flex;
  height: fit-content;
  border: 1px solid rgba(0, 200, 83, 0.42);
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
  background: rgba(0, 200, 83, 0.12);
  color: ${({ theme }) => theme.colors.success};
`;

const Stats = styled.div`
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Stat = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.surfaceGlass};

  span {
    display: block;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.78rem;
  }

  strong {
    display: block;
    margin-top: 0.3rem;
  }
`;
