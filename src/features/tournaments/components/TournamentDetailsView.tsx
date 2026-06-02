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
import { GroupMatchStatus, PlayerGroupStage, TournamentStatus } from "@/types/domain";

export function TournamentDetailsView({ tournamentId }: { tournamentId: string }) {
  const { data: groupStage, isLoading, isError } = useQuery({
    queryKey: ["player-group-stage", tournamentId],
    queryFn: mockApi.getPlayerGroupStage
  });

  if (isLoading) {
    return <PageLoader label="Loading tournament details" />;
  }

  if (isError || !groupStage) {
    return (
      <PageStack>
        <EmptyCard>
          <h2>Tournament unavailable</h2>
          <p>We could not load your active tournament data right now.</p>
        </EmptyCard>
      </PageStack>
    );
  }

  const tournament = getTournamentSummary(groupStage);
  const topStandings = groupStage.standings.slice(0, 3);

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

      {topStandings.length > 0 ? (
        <Grid $columns={3}>
          {topStandings.map((standing) => (
            <PlayerCard key={standing.player.id} player={standing.player} rankLabel={`Group Rank ${standing.rank}`} highlight={standing.rank <= (groupStage.qualificationSlots ?? 0)} />
          ))}
        </Grid>
      ) : null}

      <Card>
        <CardBody>
          <SectionTitle>
            <div>
              <h2>Group Stage Standings</h2>
              <p>Glowing line marks the current qualification cut.</p>
            </div>
          </SectionTitle>
          {groupStage.standings.length === 0 ? (
            <MutedText>No standings are available yet.</MutedText>
          ) : (
            <TableScroller>
              <LeaderboardTable standings={groupStage.standings} qualificationSlots={tournament.qualificationSlots} />
            </TableScroller>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <SectionTitle>
            <div>
              <h2>Match Schedule</h2>
              <p>Assigned group-stage matches for the active cycle.</p>
            </div>
          </SectionTitle>
          {groupStage.matches.length === 0 ? (
            <MutedText>No matches have been assigned yet.</MutedText>
          ) : (
            <Schedule>
              {groupStage.matches.map((match, index) => (
                <li key={match.id}>
                  <span>{match.scheduledAt ? formatDateTime(match.scheduledAt) : `Match ${index + 1}`}</span>
                  <strong>{match.opponent.gamerTag}</strong>
                  <Badge label={formatMatchStatus(match.status)} tone={getMatchTone(match.status)} />
                </li>
              ))}
            </Schedule>
          )}
        </CardBody>
      </Card>
    </PageStack>
  );
}

function getTournamentSummary(groupStage: PlayerGroupStage) {
  const cycle = groupStage.cycle || (groupStage.cycleNumber ? `Cycle ${groupStage.cycleNumber}` : "Active cycle");
  const group = groupStage.groupName || "Group pending";
  const qualificationSlots = groupStage.qualificationSlots ?? 0;

  return {
    name: groupStage.season ? `${groupStage.season} Group Stage` : "Group Stage",
    status: groupStage.matches.some((match) => match.status === "live" || match.status === "current")
      ? TournamentStatus.Live
      : TournamentStatus.WeeklyGroupStage,
    currentCycle: cycle,
    qualificationSlots,
    groupStage: group,
    progress: getProgress(groupStage)
  };
}

function getProgress(groupStage: PlayerGroupStage): number {
  if (groupStage.requiredMatchesPerPlayer && groupStage.requiredMatchesPerPlayer > 0) {
    const playedMatches = groupStage.matches.filter((match) => match.result !== "not_played").length;
    return Math.min(100, Math.round((playedMatches / groupStage.requiredMatchesPerPlayer) * 100));
  }

  if (groupStage.groupCapacity && groupStage.groupCapacity > 0) {
    return Math.min(100, Math.round((groupStage.totalPlayers / groupStage.groupCapacity) * 100));
  }

  return groupStage.standings.length > 0 ? 100 : 0;
}

function formatMatchStatus(status: GroupMatchStatus): string {
  const labels: Partial<Record<GroupMatchStatus, string>> = {
    pending_admin_approval: "Pending admin approval",
    played: "Awaiting confirmation",
    current: "Current"
  };

  return labels[status] ?? status.charAt(0).toUpperCase() + status.slice(1);
}

function getMatchTone(status: GroupMatchStatus): "green" | "gold" | "blue" | "muted" | "red" {
  if (status === "played" || status === "completed") return "green";
  if (status === "live" || status === "current" || status === "pending_admin_approval") return "gold";
  if (status === "disputed" || status === "cancelled") return "red";
  if (status === "pending") return "blue";
  return "muted";
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
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

const EmptyCard = styled(CardBody)`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surfaceElevated};

  h2,
  p {
    margin: 0;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const MutedText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
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
