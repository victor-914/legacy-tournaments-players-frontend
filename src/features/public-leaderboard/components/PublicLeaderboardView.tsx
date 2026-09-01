"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy, Wifi, WifiOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LeaderboardTable } from "@/components/ui/LeaderboardTable";
import { PageLoader } from "@/components/ui/PageLoader";
import { Grid, SectionTitle, TableScroller } from "@/components/ui/PagePrimitives";
import { CycleTabButton, CycleTabList } from "@/features/public-leaderboard/components/PublicCycleSelector";
import { publicLeaderboardService } from "@/features/public-leaderboard/services/publicLeaderboardService";
import { usePublicLeaderboardLive } from "@/features/public-leaderboard/hooks/usePublicLeaderboardLive";
import type { PublicLeaderboardEntry, PublicQualifierCycle } from "@/features/public-leaderboard/types";
import type { Standing } from "@/types/domain";

// Land on the most recent cycle that has actually awarded something; the
// running cycle is always empty until it is completed.
function defaultCycleId(cycles: PublicQualifierCycle[]): string | null {
  const awarded = [...cycles].reverse().find((cycle) => cycle.qualifierCount > 0);
  return awarded?.cycleId ?? cycles[cycles.length - 1]?.cycleId ?? null;
}

export function PublicLeaderboardView() {
  const { connected } = usePublicLeaderboardLive();
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    // Prefixed with "public-leaderboard" so the live hook's invalidation
    // still reaches it.
    queryKey: ["public-leaderboard", "by-cycle"],
    queryFn: () => publicLeaderboardService.getPublicQualifiersByCycle()
  });

  const cycles = useMemo(() => data?.cycles ?? [], [data]);

  useEffect(() => {
    if (cycles.length === 0) {
      return;
    }
    if (!selectedCycleId || !cycles.some((cycle) => cycle.cycleId === selectedCycleId)) {
      setSelectedCycleId(defaultCycleId(cycles));
    }
  }, [cycles, selectedCycleId]);

  if (isLoading) {
    return <PageLoader label="Loading public leaderboard" />;
  }

  const selectedCycle = cycles.find((cycle) => cycle.cycleId === selectedCycleId) ?? null;
  const standings = toStandings(selectedCycle?.entries ?? []);
  const topThree = standings.slice(0, 3);
  const totalQualified = data?.total ?? 0;
  const awardedCycles = cycles.filter((cycle) => cycle.qualifierCount > 0).length;

  return (
    <>
      <Hero>
        <CardBody>
          <TopRow>
            <Trophy size={54} />
            <LiveBadge $connected={connected} aria-label={connected ? "Live updates connected" : "Live updates offline"}>
              {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span>{connected ? "Live" : "Offline"}</span>
            </LiveBadge>
          </TopRow>
          <h1>Grand Finale Qualifiers</h1>
          <p>
            {data?.seasonName ? `${data.seasonName} · ` : ""}
            {totalQualified} qualified player{totalQualified === 1 ? "" : "s"}
            {awardedCycles > 0 ? ` across ${awardedCycles} cycle${awardedCycles === 1 ? "" : "s"}` : ""}
            {data?.generatedAt ? ` · updated ${formatGeneratedAt(data.generatedAt)}` : ""}
          </p>
        </CardBody>
      </Hero>

      {isError ? (
        <Card>
          <Notice>
            <strong>Leaderboard unavailable</strong>
            <p>Try refreshing to reload the latest standings.</p>
            <Button variant="secondary" onClick={() => void refetch()} disabled={isFetching}>
              {isFetching ? "Refreshing..." : "Refresh"}
            </Button>
          </Notice>
        </Card>
      ) : null}

      {cycles.length > 0 ? (
        <CycleTabList role="tablist" aria-label="Qualifiers by cycle">
          {cycles.map((cycle) => (
            <CycleTabButton
              key={cycle.cycleId}
              type="button"
              role="tab"
              aria-selected={cycle.cycleId === selectedCycleId}
              data-active={cycle.cycleId === selectedCycleId}
              $muted={cycle.qualifierCount === 0}
              onClick={() => setSelectedCycleId(cycle.cycleId)}
            >
              {cycle.cycleName || `Cycle ${cycle.cycleNumber}`}
              <TabCount>{cycle.qualifierCount}</TabCount>
            </CycleTabButton>
          ))}
        </CycleTabList>
      ) : null}

      {topThree.length > 0 ? (
        <Grid $columns={3}>
          {topThree.map((standing) => (
            <TopCard key={standing.player.id}>
              <CardBody>
                <RankBadge>#{standing.rank}</RankBadge>
                <PlayerName>{standing.player.gamerTag}</PlayerName>
                <PlayerStat>
                  {standing.points} pts
                  {standing.qualifiedGroupName ? ` · ${standing.qualifiedGroupName}` : ""}
                </PlayerStat>
              </CardBody>
            </TopCard>
          ))}
        </Grid>
      ) : null}

      <Card>
        <CardBody>
          <SectionTitle>
            <div>
              <h2>{selectedCycle ? `${selectedCycle.cycleName} Qualifiers` : "Qualifiers"}</h2>
              <p>
                {selectedCycle && selectedCycle.status !== "completed"
                  ? "This cycle is still being played. Qualifiers are announced when it ends."
                  : "Ranked by the group-stage points each player qualified on."}
              </p>
            </div>
          </SectionTitle>
          {standings.length === 0 && !isError ? (
            <EmptyState>
              {selectedCycle && selectedCycle.status === "completed"
                ? "No qualifiers were awarded from this cycle."
                : "Rankings are published when a cycle ends. Check back once the current cycle is complete."}
            </EmptyState>
          ) : (
            <TableScroller>
              {/* Every row is from the selected cycle, so show the group each
                  player came through rather than repeating the cycle name. */}
              <LeaderboardTable standings={standings} showQualificationLine={false} showGroupColumn />
            </TableScroller>
          )}
        </CardBody>
      </Card>
    </>
  );
}

function toStandings(entries: PublicLeaderboardEntry[]): Standing[] {
  return entries.map((entry) => ({
    rank: entry.rank,
    player: {
      id: entry.playerId,
      gamerTag: entry.gamerTag,
      avatarUrl: entry.avatarUrl ?? "",
      rank: "",
      xp: entry.xp,
      level: 0,
      winRate: 0,
      streak: 0,
      qualificationStatus: entry.qualificationStatus
    },
    wins: entry.wins,
    losses: entry.losses,
    matchesPlayed: entry.matchesPlayed,
    xp: entry.xp,
    points: entry.points,
    qualificationStatus: entry.qualificationStatus,
    movement: "same",
    qualifiedCycleId: entry.qualifiedCycleId,
    qualifiedCycleName: entry.qualifiedCycleName,
    qualifiedGroupName: entry.qualifiedGroupName,
    qualifiedGroupRank: entry.qualifiedGroupRank
  }));
}

function formatGeneratedAt(value: string): string {
  try {
    return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
  } catch {
    return value;
  }
}

const Hero = styled(Card)`
  min-height: 12rem;
  display: grid;
  align-items: end;

  svg {
    color: ${({ theme }) => theme.colors.gold};
    filter: drop-shadow(0 0 22px rgba(212, 175, 55, 0.55));
  }

  h1 {
    margin: 0.8rem 0 0.4rem;
    font-size: clamp(2.1rem, 7vw, 4rem);
    line-height: 0.95;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    min-height: 16rem;
  }
`;

const TopRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-wrap: nowrap;
    gap: 1rem;
  }
`;

const LiveBadge = styled.div<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  height: 2rem;
  padding: 0 0.7rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surfaceGlass};
  color: ${({ $connected, theme }) => ($connected ? theme.colors.success : theme.colors.textDim)};
  font-size: 0.76rem;
  font-weight: 900;

  svg {
    color: inherit;
    filter: none;
  }
`;

const TabCount = styled.span`
  margin-left: 0.45rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.7rem;
  font-weight: 900;
`;

const Notice = styled(CardBody)`
  display: grid;
  gap: 0.75rem;

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const TopCard = styled(Card)``;

const RankBadge = styled.div`
  color: ${({ theme }) => theme.colors.gold};
  font-weight: 900;
  font-size: 1.4rem;
`;

const PlayerName = styled.div`
  margin-top: 0.35rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  font-size: 1.1rem;
`;

const PlayerStat = styled.div`
  margin-top: 0.2rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const EmptyState = styled.div`
  min-height: 9rem;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.textMuted};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 8px;
`;
