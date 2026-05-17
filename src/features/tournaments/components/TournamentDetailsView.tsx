"use client";

import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { LeaderboardTable } from "@/components/ui/LeaderboardTable";
import { PageLoader } from "@/components/ui/PageLoader";
import { Grid, PageStack, SectionTitle, TableScroller } from "@/components/ui/PagePrimitives";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { mockApi } from "@/services/mockApi";
import { standings, upcomingMatch } from "@/constants/mockData";

export function TournamentDetailsView({ tournamentId }: { tournamentId: string }) {
  const { data: tournament, isLoading } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: () => mockApi.getTournament(tournamentId)
  });

  if (isLoading || !tournament) {
    return <PageLoader label="Loading tournament details" />;
  }

  return (
    <PageStack>
      <Hero>
        <CardBody>
          <Badge status={tournament.status} />
          <h1>{tournament.name}</h1>
          <p>{tournament.currentCycle} / {tournament.qualificationSlots} qualification slots / {tournament.groupStage}</p>
          <ProgressBar value={tournament.progress} label="Cycle progress" />
        </CardBody>
      </Hero>

      <Grid $columns={3}>
        {standings.slice(0, 3).map((standing) => (
          <PlayerCard key={standing.player.id} player={standing.player} rankLabel={`Group Rank ${standing.rank}`} highlight={standing.rank <= 2} />
        ))}
      </Grid>

      <Card>
        <CardBody>
          <SectionTitle>
            <div>
              <h2>Group Stage Standings</h2>
              <p>Glowing line marks the current qualification cut.</p>
            </div>
          </SectionTitle>
          <TableScroller>
            <LeaderboardTable standings={standings} />
          </TableScroller>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <SectionTitle>
            <div>
              <h2>Match Schedule</h2>
              <p>10 matched opponents rotate through the active cycle.</p>
            </div>
          </SectionTitle>
          <Schedule>
            {Array.from({ length: 10 }, (_, index) => (
              <li key={index}>
                <span>Round {index + 1}</span>
                <strong>{index === 0 ? upcomingMatch.opponent.gamerTag : standings[index % standings.length].player.gamerTag}</strong>
                <Badge label={index < 3 ? "Verified" : index < 7 ? "Scheduled" : "Pending"} tone={index < 3 ? "green" : "blue"} />
              </li>
            ))}
          </Schedule>
        </CardBody>
      </Card>
    </PageStack>
  );
}

const Hero = styled(Card)`
  min-height: 18rem;
  display: grid;
  align-items: end;

  h1 {
    margin: 1rem 0 0.35rem;
    font-size: clamp(2.4rem, 8vw, 5rem);
    line-height: 0.95;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Schedule = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.65rem;

  li {
    display: grid;
    grid-template-columns: 5rem 1fr auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.8rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: rgba(255, 255, 255, 0.04);
  }

  span {
    color: ${({ theme }) => theme.colors.textDim};
    font-size: 0.78rem;
  }
`;
