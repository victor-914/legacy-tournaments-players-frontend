"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy, WifiOff } from "lucide-react";
import { ShaderBackdrop } from "@/components/ui/ShaderBackdrop";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LeaderboardTable } from "@/components/ui/LeaderboardTable";
import { PageLoader } from "@/components/ui/PageLoader";
import { SectionTitle, TableScroller } from "@/components/ui/PagePrimitives";
import { CycleTabButton, CycleTabList } from "@/features/public-leaderboard/components/PublicCycleSelector";
import { QualifierPodium } from "@/features/public-leaderboard/components/QualifierPodium";
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
  const totalQualified = data?.total ?? 0;
  const awardedCycles = cycles.filter((cycle) => cycle.qualifierCount > 0).length;

  return (
    <>
      <Hero>
        <ShaderBackdrop intensity={0.4} renderScale={0.5} />
        <HeroScrim aria-hidden="true" />
        <HeroBody>
          <TopRow>
            <HeroTitle>
              <Eyebrow>
                <Trophy size={16} aria-hidden="true" />
                {data?.seasonName ?? "Season standings"}
              </Eyebrow>
              <h1>Grand Finale Qualifiers</h1>
            </HeroTitle>
            <LiveBadge $connected={connected} role="status">
              {connected ? <LivePulse aria-hidden="true" /> : <WifiOff size={14} aria-hidden="true" />}
              <span>{connected ? "Live updates" : "Offline"}</span>
            </LiveBadge>
          </TopRow>
          <HeroStats>
            <HeroStat>
              <strong>{totalQualified}</strong>
              <span>Qualified players</span>
            </HeroStat>
            <HeroStat>
              <strong>{awardedCycles}</strong>
              <span>Cycles awarded</span>
            </HeroStat>
            <HeroStat>
              <strong>{data?.generatedAt ? formatGeneratedAt(data.generatedAt) : "—"}</strong>
              <span>Last updated</span>
            </HeroStat>
          </HeroStats>
        </HeroBody>
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

      <QualifierPodium standings={standings} />

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
      // Fall back through both id spellings, then rank+tag, so React keys are
      // never undefined (they were, which collapsed rows on re-render).
      id: entry.playerId ?? entry.id ?? `${entry.rank}-${entry.gamerTag}`,
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

const Hero = styled.section`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.background};
  box-shadow: ${({ theme }) => theme.shadows.panel};
`;

const HeroScrim = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* Keeps the copy in the lower-left legible over the shader. */
  background: linear-gradient(100deg, rgba(11, 11, 11, 0.9) 0%, rgba(11, 11, 11, 0.6) 50%, rgba(11, 11, 11, 0.2) 100%);
`;

const HeroBody = styled.div`
  position: relative;
  display: grid;
  gap: 1.75rem;
  padding: 1.5rem 1.25rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    gap: 2.5rem;
    padding: 2.5rem 2.25rem 2.25rem;
  }
`;

const TopRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
`;

const HeroTitle = styled.div`
  display: grid;
  gap: 0.6rem;

  h1 {
    margin: 0;
    font-family: ${({ theme }) => theme.typography.displayFontFamily};
    font-weight: 400;
    font-size: clamp(2.4rem, 8vw, 4.75rem);
    line-height: 0.95;
    text-transform: uppercase;
    text-wrap: balance;
  }
`;

const Eyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: ${({ theme }) => theme.colors.gold};
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const HeroStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
  margin: 0;
  max-width: 40rem;
`;

const HeroStat = styled.div`
  display: grid;
  gap: 0.2rem;
  padding: 0.85rem 0.9rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(22, 22, 22, 0.7);
  backdrop-filter: blur(10px);

  strong {
    font-family: ${({ theme }) => theme.typography.displayFontFamily};
    font-weight: 400;
    font-size: clamp(1.35rem, 4vw, 1.9rem);
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  span {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
`;

const LiveBadge = styled.div<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2rem;
  padding: 0 0.8rem;
  border: 1px solid ${({ $connected, theme }) => ($connected ? "rgba(0, 200, 83, 0.4)" : theme.colors.border)};
  border-radius: 999px;
  background: ${({ $connected }) => ($connected ? "rgba(0, 200, 83, 0.1)" : "rgba(255, 255, 255, 0.06)")};
  color: ${({ $connected, theme }) => ($connected ? theme.colors.success : theme.colors.textDim)};
  font-size: 0.76rem;
  font-weight: 900;
`;

const LivePulse = styled.i`
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: currentColor;
  animation: lbPulse 1.8s ease-out infinite;

  @keyframes lbPulse {
    0% {
      box-shadow: 0 0 0 0 rgba(0, 200, 83, 0.55);
    }
    100% {
      box-shadow: 0 0 0 0.5rem rgba(0, 200, 83, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
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





const EmptyState = styled.div`
  min-height: 9rem;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.textMuted};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 8px;
`;
