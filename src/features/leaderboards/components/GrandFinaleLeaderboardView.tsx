"use client";

import { Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { Card, CardBody } from "@/components/ui/Card";
import { LeaderboardTable } from "@/components/ui/LeaderboardTable";
import { PageLoader } from "@/components/ui/PageLoader";
import { Grid, PageStack, SectionTitle, TableScroller } from "@/components/ui/PagePrimitives";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { mockApi } from "@/services/mockApi";

export function GrandFinaleLeaderboardView() {
  const { data, isLoading } = useQuery({ queryKey: ["leaderboard"], queryFn: mockApi.getLeaderboard });

  if (isLoading || !data) {
    return <PageLoader label="Loading championship leaderboard" />;
  }

  return (
    <PageStack>
      <Hero>
        <CardBody>
          <Crown size={54} />
          <h1>Grand Finale Leaderboard</h1>
          <p>Season progress is locking elite qualification spots.</p>
          <ProgressBar value={64} label="Season qualification progress" />
        </CardBody>
      </Hero>
      <Grid $columns={3}>
        {data.slice(0, 3).map((standing) => (
          <PlayerCard key={standing.player.id} player={standing.player} highlight rankLabel={`Elite #${standing.rank}`} />
        ))}
      </Grid>
      <Card>
        <CardBody>
          <SectionTitle>
            <div>
              <h2>Championship Table</h2>
              <p>Rank, XP, points, win rate, and cycle position.</p>
            </div>
          </SectionTitle>
          <TableScroller>
            <LeaderboardTable standings={data} showQualificationLine={false} />
          </TableScroller>
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
