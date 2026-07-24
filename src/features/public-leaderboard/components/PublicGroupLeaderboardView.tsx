"use client";

import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { Card, CardBody } from "@/components/ui/Card";
import { LeaderboardTable } from "@/components/ui/LeaderboardTable";
import { SectionTitle, TableScroller } from "@/components/ui/PagePrimitives";
import { publicLeaderboardService } from "@/features/public-leaderboard/services/publicLeaderboardService";
import { usePublicGroupLeaderboardLive } from "@/features/public-leaderboard/hooks/usePublicGroupLeaderboardLive";
import type { PublicGroupLeaderboardEntry } from "@/features/public-leaderboard/types";
import type { Standing } from "@/types/domain";

interface PublicGroupLeaderboardViewProps {
  groupId: string;
}

export function PublicGroupLeaderboardView({ groupId }: PublicGroupLeaderboardViewProps) {
  usePublicGroupLeaderboardLive(groupId);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-group-leaderboard", groupId],
    queryFn: () => publicLeaderboardService.getPublicGroupLeaderboard(groupId)
  });

  if (isLoading) {
    return <Placeholder>Loading group leaderboard...</Placeholder>;
  }

  if (isError || !data) {
    return (
      <Card>
        <Notice>
          <strong>Group leaderboard unavailable</strong>
          <p>Try selecting the group again.</p>
        </Notice>
      </Card>
    );
  }

  const standings = toStandings(Array.isArray(data.entries) ? data.entries : []);

  return (
    <Card>
      <CardBody>
        <SectionTitle>
          <div>
            <h2>{data.groupName}</h2>
            <p>Ranked by points, wins, and score difference within this group.</p>
          </div>
        </SectionTitle>
        {standings.length === 0 ? (
          <EmptyState>No standings recorded for this group yet.</EmptyState>
        ) : (
          <TableScroller>
            <LeaderboardTable standings={standings} showQualificationLine={false} />
          </TableScroller>
        )}
      </CardBody>
    </Card>
  );
}

function toStandings(entries: PublicGroupLeaderboardEntry[]): Standing[] {
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
    scoreDifference: entry.scoreDifference,
    xp: entry.xp,
    points: entry.points,
    qualificationStatus: entry.qualificationStatus,
    movement: "same"
  }));
}

const Placeholder = styled.div`
  padding: 0.9rem;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.86rem;
`;

const Notice = styled(CardBody)`
  display: grid;
  gap: 0.5rem;

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
