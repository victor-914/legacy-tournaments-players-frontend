"use client";

import { Trophy, Wifi, WifiOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LeaderboardTable } from "@/components/ui/LeaderboardTable";
import { PageLoader } from "@/components/ui/PageLoader";
import { Grid, SectionTitle, TableScroller } from "@/components/ui/PagePrimitives";
import { publicLeaderboardService } from "@/features/public-leaderboard/services/publicLeaderboardService";
import { usePublicLeaderboardLive } from "@/features/public-leaderboard/hooks/usePublicLeaderboardLive";
import type { PublicLeaderboardEntry } from "@/features/public-leaderboard/types";
import type { Standing } from "@/types/domain";

export function PublicLeaderboardView() {
  const { connected } = usePublicLeaderboardLive();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["public-leaderboard"],
    queryFn: () => publicLeaderboardService.getPublicLeaderboard()
  });

  if (isLoading) {
    return <PageLoader label="Loading public leaderboard" />;
  }

  const entries = data?.entries ?? [];
  const standings = toStandings(entries);
  const topThree = standings.slice(0, 3);

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
          <h1>Public Leaderboard</h1>
          <p>
            {data?.seasonName ? `${data.seasonName} · ` : ""}
            {entries.length} ranked player{entries.length === 1 ? "" : "s"}
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

      {topThree.length > 0 ? (
        <Grid $columns={3}>
          {topThree.map((standing) => (
            <TopCard key={standing.player.id}>
              <CardBody>
                <RankBadge>#{standing.rank}</RankBadge>
                <PlayerName>{standing.player.gamerTag}</PlayerName>
                <PlayerStat>{standing.points} pts</PlayerStat>
              </CardBody>
            </TopCard>
          ))}
        </Grid>
      ) : null}

      <Card>
        <CardBody>
          <SectionTitle>
            <div>
              <h2>Leaderboard</h2>
              <p>Ranked by points, wins, and score difference.</p>
            </div>
          </SectionTitle>
          {standings.length === 0 && !isError ? (
            <EmptyState>No leaderboard data is available yet.</EmptyState>
          ) : (
            <TableScroller>
              <LeaderboardTable standings={standings} showQualificationLine={false} />
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
    xp: entry.xp,
    points: entry.points,
    qualificationStatus: entry.qualificationStatus,
    movement: "same"
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
  min-height: 16rem;
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
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
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
