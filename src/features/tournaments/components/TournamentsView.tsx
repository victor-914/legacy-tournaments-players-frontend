"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import styled, { css } from "styled-components";
import { ApprovalNotice } from "@/components/auth/ApprovalNotice";
import { Card, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageStack, SectionTitle, TableScroller } from "@/components/ui/PagePrimitives";
import { mockApi } from "@/services/mockApi";
import { playerService } from "@/services/playerService";
import type { GroupMatchResult, GroupMatchStatus, GroupStageMatch, PlayerGroupStage, Standing } from "@/types/domain";
import { isApprovedPlayer } from "@/utils/approval";

interface PlayerRecord {
  played: number;
  wins: number;
  losses: number;
  remaining: number;
}

export function TournamentsView() {
  const meQuery = useQuery({ queryKey: ["players-me"], queryFn: playerService.getMe });
  const approved = isApprovedPlayer(meQuery.data);
  const {
    data,
    isLoading,
    isError
  } = useQuery({ queryKey: ["player-group-stage"], queryFn: mockApi.getPlayerGroupStage, enabled: approved });

  const record = useMemo(() => (data ? getPlayerRecord(data.matches) : null), [data]);

  if (meQuery.isLoading || isLoading) {
    return <PageLoader label="Loading group stage" />;
  }

  if (!approved) {
    return (
      <PageStack>
        <ApprovalNotice />
      </PageStack>
    );
  }

  if (isError) {
    return (
      <PageStack>
        <EmptyCard>
          <h2>Group Stage Unavailable</h2>
          <p>We could not load your group stage right now.</p>
        </EmptyCard>
      </PageStack>
    );
  }

  if (!data) {
    return (
      <PageStack>
        <EmptyCard>
          <h2>Group Stage</h2>
          <p>No group stage data is available.</p>
        </EmptyCard>
      </PageStack>
    );
  }

  if (!data.isAdded) {
    return (
      <PageStack>
        <GroupStageStatus groupStage={data} />
        <EmptyCard>
          <p>You have not been added to a group stage yet.</p>
        </EmptyCard>
      </PageStack>
    );
  }

  return (
    <PageStack>
      <SectionTitle>
        <div>
          <h2>Group Stage</h2>
          <p>Your current tournament group, matches, and standing.</p>
        </div>
      </SectionTitle>

      <TopGrid>
        <GroupStageStatus groupStage={data} />
        <CurrentMatchCard match={data.currentMatch} />
      </TopGrid>

      <PlayerRecordCard record={record ?? getPlayerRecord([])} totalMatches={data.matches.length} />

      <ContentGrid>
        <GroupMatchesList matches={data.matches} />
        <GroupStandingTable standings={data.standings} playerId={data.player.id} />
      </ContentGrid>
    </PageStack>
  );
}

function GroupStageStatus({ groupStage }: { groupStage: PlayerGroupStage }) {
  return (
    <Card>
      <CardBody>
        <CardHeader>
          <div>
            <Kicker>Group Stage Status</Kicker>
            <h3>{groupStage.isAdded ? "Added to group stage" : "Not added yet"}</h3>
          </div>
          <StatusPill $tone={groupStage.isAdded ? "gold" : "muted"}>{groupStage.isAdded ? "Active" : "Waiting"}</StatusPill>
        </CardHeader>

        {groupStage.isAdded ? (
          <MetaGrid>
            <MetaItem>
              <span>Group</span>
              <strong>{groupStage.groupName ?? "Pending"}</strong>
            </MetaItem>
            <MetaItem>
              <span>Season</span>
              <strong>{groupStage.season ?? "Pending"}</strong>
            </MetaItem>
            <MetaItem>
              <span>Cycle</span>
              <strong>{groupStage.cycle ?? "Pending"}</strong>
            </MetaItem>
            <MetaItem>
              <span>Players</span>
              <strong>{groupStage.totalPlayers}</strong>
            </MetaItem>
          </MetaGrid>
        ) : (
          <MutedText>You have not been added to a group stage yet.</MutedText>
        )}
      </CardBody>
    </Card>
  );
}

function CurrentMatchCard({ match }: { match?: GroupStageMatch }) {
  if (!match) {
    return (
      <HighlightedCard>
        <CardBody>
          <Kicker>Current Match</Kicker>
          <h3>Current Match</h3>
          <MutedText>No current match assigned yet.</MutedText>
        </CardBody>
      </HighlightedCard>
    );
  }

  return (
    <HighlightedCard>
      <CardBody>
        <CardHeader>
          <div>
            <Kicker>Current Match</Kicker>
            <h3>{match.opponent.gamerTag}</h3>
          </div>
          <StatusPill $tone="gold">{formatMatchStatus(match.status)}</StatusPill>
        </CardHeader>
        <DetailList>
          <DetailRow>
            <span>Opponent</span>
            <strong>{match.opponent.gamerTag}</strong>
          </DetailRow>
          <DetailRow>
            <span>Status</span>
            <strong>{formatMatchStatus(match.status)}</strong>
          </DetailRow>
          <DetailRow>
            <span>Scheduled</span>
            <strong>{formatDateTime(match.scheduledAt)}</strong>
          </DetailRow>
          <DetailRow>
            <span>Result</span>
            <strong>{formatMatchResult(match.result)}</strong>
          </DetailRow>
          <DetailRow>
            <span>Score</span>
            <strong>{formatScore(match)}</strong>
          </DetailRow>
        </DetailList>
        {isPlayableMatch(match.status) ? <MatchLink href={`/matches/${match.id}/live`}>Play Match</MatchLink> : null}
      </CardBody>
    </HighlightedCard>
  );
}

function PlayerRecordCard({ record, totalMatches }: { record: PlayerRecord; totalMatches: number }) {
  return (
    <RecordGrid>
      <RecordItem>
        <span>Matches played</span>
        <strong>{record.played}</strong>
      </RecordItem>
      <RecordItem>
        <span>Wins</span>
        <strong>{record.wins}</strong>
      </RecordItem>
      <RecordItem>
        <span>Losses</span>
        <strong>{record.losses}</strong>
      </RecordItem>
      <RecordItem>
        <span>Remaining</span>
        <strong>{record.remaining}</strong>
      </RecordItem>
      <RecordItem>
        <span>Assigned matches</span>
        <strong>{totalMatches}</strong>
      </RecordItem>
    </RecordGrid>
  );
}

function GroupMatchesList({ matches }: { matches: GroupStageMatch[] }) {
  return (
    <Card>
      <CardBody>
        <CardHeader>
          <div>
            <Kicker>Group Matches</Kicker>
            <h3>Assigned Matches</h3>
          </div>
        </CardHeader>
        {matches.length === 0 ? (
          <MutedText>No group matches assigned yet.</MutedText>
        ) : (
          <TableScroller>
            <Table>
              <thead>
                <tr>
                  <th>Opponent</th>
                  <th>Status</th>
                  <th>Result</th>
                  <th>Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <MatchRow key={match.id} $current={match.status === "current"}>
                    <td>{match.opponent.gamerTag}</td>
                    <td><StatusPill $tone={match.status === "current" ? "gold" : "muted"}>{formatMatchStatus(match.status)}</StatusPill></td>
                    <td>{formatMatchResult(match.result)}</td>
                    <td>{formatScore(match)}</td>
                    <td>
                      {isPlayableMatch(match.status) ? (
                        <TableActionLink href={`/matches/${match.id}/live`}>Open Match</TableActionLink>
                      ) : (
                        <MutedAction>Unavailable</MutedAction>
                      )}
                    </td>
                  </MatchRow>
                ))}
              </tbody>
            </Table>
          </TableScroller>
        )}
      </CardBody>
    </Card>
  );
}

function GroupStandingTable({ standings, playerId }: { standings: Standing[]; playerId: string }) {
  const currentStanding = standings.find((standing) => standing.player.id === playerId);

  return (
    <Card>
      <CardBody>
        <CardHeader>
          <div>
            <Kicker>Current Standing</Kicker>
            <h3>{currentStanding ? `Rank ${currentStanding.rank}` : "Not ranked yet"}</h3>
          </div>
        </CardHeader>
        {standings.length === 0 ? (
          <MutedText>No standings are available yet.</MutedText>
        ) : (
          <TableScroller>
            <Table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Played</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((standing) => (
                  <StandingRow key={standing.player.id} $active={standing.player.id === playerId}>
                    <td>{standing.rank}</td>
                    <td>{standing.player.gamerTag}</td>
                    <td>{standing.wins + standing.losses}</td>
                    <td>{standing.wins}</td>
                    <td>{standing.losses}</td>
                    <td>{standing.points}</td>
                  </StandingRow>
                ))}
              </tbody>
            </Table>
          </TableScroller>
        )}
      </CardBody>
    </Card>
  );
}

function getPlayerRecord(matches: GroupStageMatch[]): PlayerRecord {
  const playedMatches = matches.filter((match) => match.status === "played");

  return {
    played: playedMatches.length,
    wins: playedMatches.filter((match) => match.result === "win").length,
    losses: playedMatches.filter((match) => match.result === "loss").length,
    remaining: matches.filter((match) => match.status !== "played").length
  };
}

function formatMatchStatus(status: GroupMatchStatus): string {
  const labels: Partial<Record<GroupMatchStatus, string>> = {
    pending_admin_approval: "Pending admin approval",
    played: "Awaiting confirmation",
    current: "Current"
  };

  if (labels[status]) {
    return labels[status];
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatMatchResult(result: GroupMatchResult): string {
  if (result === "not_played") return "Not played";
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function formatScore(match: GroupStageMatch): string {
  if (typeof match.playerScore !== "number" || typeof match.opponentScore !== "number") {
    return "-";
  }

  return `${match.playerScore}-${match.opponentScore}`;
}

function isPlayableMatch(status: GroupMatchStatus): boolean {
  return status === "pending" || status === "current" || status === "live";
}

function formatDateTime(value?: string): string {
  if (!value) return "Not scheduled";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

const TopGrid = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.8fr);
  }
`;

const ContentGrid = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  }
`;

const HighlightedCard = styled(Card)`
  border-color: ${({ theme }) => theme.colors.borderStrong};
  box-shadow: ${({ theme }) => theme.shadows.glowGold};
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

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  h3 {
    margin: 0.2rem 0 0;
    font-size: 1.1rem;
  }
`;

const Kicker = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.gold};
  font-size: 0.74rem;
  font-weight: 900;
  text-transform: uppercase;
`;

const MutedText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const MetaGrid = styled.div`
  display: grid;
  gap: 0.75rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const MetaItem = styled.div`
  display: grid;
  gap: 0.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 0.8rem;
  background: ${({ theme }) => theme.colors.surfaceGlass};

  span {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.78rem;
  }
`;

const DetailList = styled.div`
  display: grid;
  gap: 0.65rem;
`;

const MatchLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  margin-top: 1rem;
  border-radius: 8px;
  padding: 0 1rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.gold}, #8d6d16);
  color: #090909;
  box-shadow: ${({ theme }) => theme.shadows.glowGold};
  font-weight: 900;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 0.65rem;

  span {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  strong {
    text-align: right;
  }
`;

const RecordGrid = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`;

const RecordItem = styled(CardBody)`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surfaceElevated};

  span {
    display: block;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.78rem;
  }

  strong {
    display: block;
    margin-top: 0.35rem;
    color: ${({ theme }) => theme.colors.gold};
    font-size: 1.45rem;
  }
`;

const Table = styled.table`
  width: 100%;
  min-width: 34rem;
  border-collapse: collapse;

  th,
  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding: 0.8rem 0.65rem;
    text-align: left;
    white-space: nowrap;
  }

  th {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.74rem;
    text-transform: uppercase;
  }
`;

const TableActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.25rem;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 8px;
  padding: 0 0.75rem;
  color: ${({ theme }) => theme.colors.gold};
  font-size: 0.78rem;
  font-weight: 900;
`;

const MutedAction = styled.span`
  color: ${({ theme }) => theme.colors.textDim};
  font-size: 0.78rem;
  font-weight: 800;
`;

const MatchRow = styled.tr<{ $current: boolean }>`
  ${({ $current, theme }) =>
    $current &&
    css`
      background: ${theme.colors.goldSoft};
      color: ${theme.colors.text};
    `}
`;

const StandingRow = styled.tr<{ $active: boolean }>`
  ${({ $active, theme }) =>
    $active &&
    css`
      background: ${theme.colors.goldSoft};
      color: ${theme.colors.text};
      font-weight: 900;
    `}
`;

const StatusPill = styled.span<{ $tone: "gold" | "muted" }>`
  display: inline-flex;
  width: fit-content;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  padding: 0.28rem 0.55rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;

  ${({ $tone, theme }) =>
    $tone === "gold" &&
    css`
      border-color: ${theme.colors.borderStrong};
      background: ${theme.colors.goldSoft};
      color: ${theme.colors.gold};
    `}
`;
