"use client";

import { Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LeaderboardTable } from "@/components/ui/LeaderboardTable";
import { PageLoader } from "@/components/ui/PageLoader";
import { Grid, PageStack, SectionTitle, TableScroller } from "@/components/ui/PagePrimitives";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { mockApi } from "@/services/mockApi";

export function GrandFinaleLeaderboardView() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({ queryKey: ["leaderboard"], queryFn: mockApi.getLeaderboard });

  if (isLoading) {
    return <PageLoader label="Loading championship leaderboard" />;
  }

  const standings = data ?? [];
  const topQualifiers = standings.slice(0, 3);

  return (
    <PageStack>
      <Hero>
        <CardBody>
          <Crown size={54} />
          <h1>Championship Leaderboard</h1>
          <p>{standings.length} qualified player{standings.length === 1 ? "" : "s"} locked into the championship table.</p>
          <ProgressBar value={standings.length > 0 ? 100 : 0} label="Championship qualifier list" />
        </CardBody>
      </Hero>

      {isError ? (
        <Card>
          <Notice>
            <strong>Leaderboard unavailable</strong>
            <p>Try refreshing the championship qualifier list.</p>
            <Button variant="secondary" onClick={() => void refetch()} disabled={isFetching}>
              {isFetching ? "Refreshing..." : "Refresh"}
            </Button>
          </Notice>
        </Card>
      ) : null}

      {topQualifiers.length > 0 ? (
        <Grid $columns={3}>
          {topQualifiers.map((standing) => (
            <PlayerCard key={standing.player.id} player={standing.player} highlight rankLabel={`Championship #${standing.rank}`} />
          ))}
        </Grid>
      ) : null}

      <Card>
        <CardBody>
          <SectionTitle>
            <div>
              <h2>Championship Qualifiers</h2>
              <p>Qualified players ranked by seed, points, wins, score difference, and XP.</p>
            </div>
          </SectionTitle>
          {standings.length === 0 && !isError ? (
            <EmptyState>No championship qualifiers are available yet.</EmptyState>
          ) : (
            <TableScroller>
              <LeaderboardTable standings={standings} showQualificationLine={false} />
            </TableScroller>
          )}
        </CardBody>
      </Card>
    </PageStack>
  );
}

const Hero = styled(Card)`
  min-height: 19rem;
  display: grid;
  align-items: end;

  svg {
    color: ${({ theme }) => theme.colors.gold};
    filter: drop-shadow(0 0 22px rgba(212, 175, 55, 0.55));
  }

  h1 {
    margin: 0.8rem 0 0.4rem;
    font-size: clamp(2.3rem, 8vw, 5rem);
    line-height: 0.95;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
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

const EmptyState = styled.div`
  min-height: 9rem;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.textMuted};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 8px;
`;
