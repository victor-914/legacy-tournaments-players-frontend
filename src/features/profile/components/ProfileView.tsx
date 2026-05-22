"use client";

import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { Grid, PageStack, SectionTitle } from "@/components/ui/PagePrimitives";
import { PageLoader } from "@/components/ui/PageLoader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { playerService } from "@/services/playerService";
import type { PlayerMeDashboard } from "@/types/domain";
import { formatNumber } from "@/utils/format";

export function ProfileView() {
  const { data, isError, isLoading } = useQuery({ queryKey: ["players-me"], queryFn: playerService.getMe });

  if (isLoading) {
    return <PageLoader label="Loading profile" />;
  }

  if (isError || !data) {
    return (
      <PageStack>
        <EmptyCard>
          <CardBody>
            <strong>Profile unavailable</strong>
            <p>We could not load your player profile right now.</p>
          </CardBody>
        </EmptyCard>
      </PageStack>
    );
  }

  const fullName = getFullName(data);
  const gameTag = getGameTag(data);
  const currentXp = data.player?.currentXp ?? data.player?.xp ?? 0;
  const approvalStatus = getFirstText(data.membership?.approvalStatus, data.membership?.status, data.player?.approvalStatus, "pending");
  const qualificationStatus = getFirstText(data.standing?.qualificationStatus, data.membership?.qualificationStatus, data.player?.qualificationStatus);
  const progressionStatus = getFirstText(data.standing?.progressionStatus, data.membership?.progressionStatus, data.player?.progressionStatus);
  const currentRank = data.currentRank ?? data.standing?.currentRank ?? data.standing?.rank;

  return (
    <PageStack>
      <Hero>
        <CardBody>
          <Badge label={formatText(approvalStatus)} tone={getApprovalTone(approvalStatus)} />
          <h1>{gameTag}</h1>
          <p>{fullName} / {formatNumber(currentXp)} XP</p>
          <ProgressBar value={getProgressValue(data)} label="Level progression" />
        </CardBody>
      </Hero>

      <Grid $columns={4}>
        {[
          ["Current XP", formatNumber(currentXp)],
          ["Current Rank", currentRank ? `#${currentRank}` : "Not ranked"],
          ["Approval", formatText(approvalStatus)],
          ["Qualification", formatText(qualificationStatus)]
        ].map(([label, value]) => (
          <Card key={label}>
            <CardBody>
              <MetricLabel>{label}</MetricLabel>
              <MetricValue>{value}</MetricValue>
            </CardBody>
          </Card>
        ))}
      </Grid>

      <Card>
        <CardBody>
          <SectionTitle>
            <div>
              <h2>Player Details</h2>
              <p>Current season, cycle, and group assignment.</p>
            </div>
          </SectionTitle>
          <DetailsGrid>
            {[
              ["Full Name", fullName],
              ["Game Tag", gameTag],
              ["Season", formatSeason(data)],
              ["Season Dates", formatDateRange(data.season?.startDate, data.season?.endDate)],
              ["Cycle", formatCycle(data)],
              ["Cycle Dates", formatDateRange(data.cycle?.startDate, data.cycle?.endDate)],
              ["Group", formatGroup(data)],
              ["Group Capacity", formatGroupCapacity(data)],
              ["Points", String(data.standing?.points ?? 0)],
              ["Wins", String(data.standing?.wins ?? 0)],
              ["Losses", String(data.standing?.losses ?? 0)],
              ["Draws", String(data.standing?.draws ?? 0)],
              ["Matches Played", String(data.standing?.matchesPlayed ?? getMatchesPlayed(data))],
              ["Score Difference", String(data.standing?.scoreDifference ?? data.standing?.scoreDiff ?? 0)],
              ["Progression Status", formatText(progressionStatus)]
            ].map(([label, value]) => (
              <DetailTile key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </DetailTile>
            ))}
          </DetailsGrid>
        </CardBody>
      </Card>
    </PageStack>
  );
}

function getFullName(data: PlayerMeDashboard): string {
  return getFirstText(
    data.user?.fullName,
    data.user?.fullname,
    data.user?.name,
    [data.user?.firstName, data.user?.lastName].filter(Boolean).join(" "),
    "Player"
  );
}

function getGameTag(data: PlayerMeDashboard): string {
  return getFirstText(data.player?.gameTag, data.player?.gamerTag, "No game tag");
}

function getProgressValue(data: PlayerMeDashboard): number {
  const points = data.standing?.points ?? 0;
  return Math.max(0, Math.min(100, points));
}

function formatSeason(data: PlayerMeDashboard): string {
  if (!data.season) return "No active season";
  return [data.season.name, data.season.code].filter(Boolean).join(" / ") || "Active season";
}

function formatCycle(data: PlayerMeDashboard): string {
  if (!data.cycle) return "No active cycle";
  const number = data.cycle.number ?? data.cycle.cycleNumber;
  return [data.cycle.name, number ? `#${number}` : undefined].filter(Boolean).join(" / ") || "Active cycle";
}

function formatGroup(data: PlayerMeDashboard): string {
  if (!data.group) return "Not assigned";
  const number = data.group.number ?? data.group.groupNumber;
  return [data.group.name, number ? `#${number}` : undefined].filter(Boolean).join(" / ") || "Assigned";
}

function formatGroupCapacity(data: PlayerMeDashboard): string {
  if (!data.group) return "Not assigned";
  return `${data.group.currentPlayers ?? data.group.playerCount ?? 0} / ${data.group.maxPlayers ?? data.group.capacity ?? 0}`;
}

function getMatchesPlayed(data: PlayerMeDashboard): number {
  return (data.standing?.wins ?? 0) + (data.standing?.losses ?? 0) + (data.standing?.draws ?? 0);
}

function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) return "Not available";
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function formatDate(value?: string): string {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function getFirstText(...values: Array<string | undefined | null>): string {
  return values.find((value) => value && value.trim().length > 0)?.trim() ?? "";
}

function formatText(value?: string | null): string {
  if (!value) return "Not available";

  return value
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getApprovalTone(status: string): "gold" | "green" | "red" | "blue" {
  const normalized = status.toLowerCase();
  if (normalized.includes("reject")) return "red";
  if (normalized.includes("approve")) return "green";
  if (normalized.includes("waitlist")) return "blue";
  return "gold";
}

const Hero = styled(Card)`
  text-align: center;

  h1 {
    margin: 0.7rem 0 0.35rem;
    font-size: clamp(2.4rem, 8vw, 5rem);
    line-height: 0.95;
    overflow-wrap: anywhere;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const MetricLabel = styled.span`
  color: ${({ theme }) => theme.colors.textDim};
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 900;
`;

const MetricValue = styled.strong`
  display: block;
  margin-top: 0.4rem;
  font-size: 1.45rem;
  line-height: 1.1;
  overflow-wrap: anywhere;
`;

const DetailsGrid = styled.div`
  display: grid;
  gap: 0.85rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const DetailTile = styled.div`
  min-height: 5.5rem;
  display: grid;
  align-content: space-between;
  gap: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.04);

  span {
    color: ${({ theme }) => theme.colors.textDim};
    font-size: 0.75rem;
    font-weight: 900;
    text-transform: uppercase;
  }

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-size: 1.1rem;
    line-height: 1.1;
    overflow-wrap: anywhere;
  }
`;

const EmptyCard = styled(Card)`
  strong {
    display: block;
    margin-bottom: 0.4rem;
    font-size: 1.2rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;
