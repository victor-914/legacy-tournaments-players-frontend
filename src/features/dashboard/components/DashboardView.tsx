"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import styled from "styled-components";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/PageLoader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Grid, PageStack, SectionTitle, TableScroller } from "@/components/ui/PagePrimitives";
import { mockApi } from "@/services/mockApi";
import { playerService } from "@/services/playerService";
import type { FindMatch, GroupLeaderboardEntry, PlayerMeDashboard, PlayerMeStanding } from "@/types/domain";
import { formatNumber } from "@/utils/format";

type DashboardState =
  | "no_active_season"
  | "no_active_cycle"
  | "pending_approval"
  | "rejected"
  | "waitlisted"
  | "approved_assigned";

export function DashboardView() {
  const meQuery = useQuery({ queryKey: ["players-me"], queryFn: playerService.getMe });
  const findMatchesQuery = useQuery({ queryKey: ["find-matches"], queryFn: mockApi.getFindMatches });
  const groupId = meQuery.data?.group?.id;
  const leaderboardQuery = useQuery({
    enabled: Boolean(groupId),
    queryKey: ["group-leaderboard", groupId],
    queryFn: () => playerService.getGroupLeaderboard(groupId ?? "")
  });

  if (meQuery.isLoading) {
    return <PageLoader label="Loading Championship Dashboard" />;
  }

  if (meQuery.isError || !meQuery.data) {
    return <StateCard title="Dashboard unavailable" message="We could not load your championship details right now." />;
  }

  const dashboard = meQuery.data;
  const state = getDashboardState(dashboard);
  const playerId = dashboard.player?.id;
  const userId = dashboard.user?.id;
  const currentStanding = dashboard.standing;
  const currentRank = dashboard.currentRank ?? currentStanding?.currentRank ?? currentStanding?.rank;
  const progressionStatus = getFirstText(
    currentStanding?.progressionStatus,
    dashboard.membership?.progressionStatus,
    dashboard.player?.progressionStatus,
    state === "approved_assigned" ? "assigned" : state
  );
  const qualificationStatus = getFirstText(
    currentStanding?.qualificationStatus,
    dashboard.membership?.qualificationStatus,
    dashboard.player?.qualificationStatus
  );
  const approvalStatus = getApprovalStatus(dashboard);
  const currentMatch = findMatchesQuery.data?.find(isActiveMatch);

  return (
    <PageStack>
      <StatusCard as={motion.section} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <CardBody>
          <StatusContent>
            <div>
              <Badge label={stateMeta[state].badge} tone={stateMeta[state].tone} />
              <h2>{stateMeta[state].title}</h2>
              <p>{stateMeta[state].helper}</p>
            </div>
            <PlayerSummary>
              <span>{getFullName(dashboard)}</span>
              <strong>{getGameTag(dashboard)}</strong>
              <small>{formatNumber(getCurrentXp(dashboard))} XP</small>
            </PlayerSummary>
          </StatusContent>
        </CardBody>
      </StatusCard>

      <StatsGrid>
        <InfoTile>
          <span>Approval Status</span>
          <strong>{formatText(approvalStatus)}</strong>
        </InfoTile>
        <InfoTile>
          <span>Championship Qualification Status</span>
          <strong>{formatText(qualificationStatus)}</strong>
        </InfoTile>
        <InfoTile>
          <span>Current Rank</span>
          <strong>{currentRank ? `#${currentRank}` : "Not ranked"}</strong>
        </InfoTile>
        <InfoTile>
          <span>Progression Status</span>
          <strong>{formatText(progressionStatus)}</strong>
        </InfoTile>
      </StatsGrid>

      {currentMatch ? <CurrentMatchCard match={currentMatch} /> : null}

      <Grid $columns={2}>
        <Card>
          <CardBody>
            <SectionTitle>
              <div>
                <h2>Current Season</h2>
                <p>Active championship qualification window</p>
              </div>
            </SectionTitle>
            <SeasonGrid>
              <InfoTile>
                <span>Name</span>
                <strong>{dashboard.season?.name ?? "No active season"}</strong>
              </InfoTile>
              <InfoTile>
                <span>Date Range</span>
                <strong>{formatDateRange(dashboard.season?.startDate, dashboard.season?.endDate)}</strong>
              </InfoTile>
            </SeasonGrid>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <SectionTitle>
              <div>
                <h2>Current Cycle</h2>
                <p>Cycle placement and time window</p>
              </div>
            </SectionTitle>
            <SeasonGrid>
              <InfoTile>
                <span>Name</span>
                <strong>{dashboard.cycle?.name ?? "No active cycle"}</strong>
              </InfoTile>
              <InfoTile>
                <span>Number</span>
                <strong>{dashboard.cycle?.number ?? dashboard.cycle?.cycleNumber ?? "Not available"}</strong>
              </InfoTile>
              <InfoTile>
                <span>Date Range</span>
                <strong>{formatDateRange(dashboard.cycle?.startDate, dashboard.cycle?.endDate)}</strong>
              </InfoTile>
            </SeasonGrid>
          </CardBody>
        </Card>
      </Grid>

      <Card>
        <CardBody>
          <SectionTitle>
            <div>
              <h2>Group Stage Standing</h2>
              <p>Current group assignment and performance</p>
            </div>
          </SectionTitle>
          <StandingGrid>
            {getStandingRows(dashboard, currentStanding).map((item) => (
              <InfoTile key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </InfoTile>
            ))}
          </StandingGrid>
        </CardBody>
      </Card>

      {dashboard.group ? (
        <Card>
          <CardBody>
            <SectionTitle>
              <div>
                <h2>Group Leaderboard</h2>
                <p>Current group table with your row highlighted.</p>
              </div>
            </SectionTitle>
            {leaderboardQuery.isLoading ? (
              <ProgressBar value={42} label="Loading group leaderboard" />
            ) : leaderboardQuery.isError ? (
              <InlineState>Group leaderboard is unavailable right now.</InlineState>
            ) : (
              <TableScroller>
                <LeaderboardTable>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Player</th>
                      <th>W</th>
                      <th>L</th>
                      <th>D</th>
                      <th>MP</th>
                      <th>SD</th>
                      <th>Pts</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(leaderboardQuery.data ?? []).map((entry, index) => {
                      const isCurrentUser = isCurrentEntry(entry, playerId, userId);

                      return (
                        <LeaderboardRow
                          key={entry.id ?? entry.playerId ?? entry.userId ?? `${entry.rank}-${index}`}
                          $highlight={isCurrentUser}
                        >
                          <td>#{entry.rank ?? entry.currentRank ?? index + 1}</td>
                          <td>{getLeaderboardName(entry)}</td>
                          <td>{entry.wins ?? 0}</td>
                          <td>{entry.losses ?? 0}</td>
                          <td>{entry.draws ?? 0}</td>
                          <td>{entry.matchesPlayed ?? getMatchesPlayed(entry)}</td>
                          <td>{entry.scoreDifference ?? entry.scoreDiff ?? 0}</td>
                          <td>{entry.points ?? 0}</td>
                          <td>{formatText(entry.progressionStatus ?? entry.qualificationStatus)}</td>
                        </LeaderboardRow>
                      );
                    })}
                  </tbody>
                </LeaderboardTable>
              </TableScroller>
            )}
          </CardBody>
        </Card>
      ) : null}
    </PageStack>
  );
}

const stateMeta: Record<DashboardState, { badge: string; helper: string; title: string; tone: "gold" | "green" | "red" | "blue" }> = {
  no_active_season: {
    badge: "No season",
    helper: "There is no active season available for your account yet.",
    title: "No Active Season",
    tone: "blue"
  },
  no_active_cycle: {
    badge: "No cycle",
    helper: "A season is active, but no cycle is currently available.",
    title: "No Active Cycle",
    tone: "blue"
  },
  pending_approval: {
    badge: "Pending",
    helper: "Your registration is waiting for admin approval.",
    title: "Pending Approval",
    tone: "gold"
  },
  rejected: {
    badge: "Rejected",
    helper: "Your registration was rejected for this cycle.",
    title: "Registration Rejected",
    tone: "red"
  },
  waitlisted: {
    badge: "Waitlisted",
    helper: "You are approved but waiting for a group slot.",
    title: "Waitlisted",
    tone: "blue"
  },
  approved_assigned: {
    badge: "Assigned",
    helper: "You are approved and assigned to a group.",
    title: "Approved and Assigned",
    tone: "green"
  }
};

function StateCard({ message, title }: { message: string; title: string }) {
  return (
    <PageStack>
      <Header>
        <Badge label="Dashboard" tone="gold" />
        <h1>Dashboard</h1>
      </Header>
      <EmptyCard>
        <CardBody>
          <strong>{title}</strong>
          <p>{message}</p>
        </CardBody>
      </EmptyCard>
    </PageStack>
  );
}

function CurrentMatchCard({ match }: { match: FindMatch }) {
  return (
    <CurrentMatchPanel>
      <CardBody>
        <CurrentMatchContent>
          <div>
            <MatchEyebrow>Current Match</MatchEyebrow>
            <h2>{match.opponent.gamerTag}</h2>
            <p>
              {formatText(match.status)}
              {" / "}
              {match.scheduledAt ? formatDateTime(match.scheduledAt) : "Not scheduled"}
            </p>
          </div>
          <MatchAction href={`/matches/${match.id}/live`}>Open Match</MatchAction>
        </CurrentMatchContent>
      </CardBody>
    </CurrentMatchPanel>
  );
}

function isActiveMatch(match: FindMatch): boolean {
  return match.status === "pending" || match.status === "live" || match.status === "current";
}

function getDashboardState(dashboard: PlayerMeDashboard): DashboardState {
  if (!dashboard.season) return "no_active_season";
  if (!dashboard.cycle) return "no_active_cycle";

  const approvalStatus = getApprovalStatus(dashboard).toLowerCase();
  if (approvalStatus.includes("reject")) return "rejected";
  if (approvalStatus.includes("waitlist")) return "waitlisted";
  if (approvalStatus.includes("pending")) return "pending_approval";
  if (dashboard.group) return "approved_assigned";

  return "waitlisted";
}

function getApprovalStatus(dashboard: PlayerMeDashboard): string {
  return getFirstText(dashboard.membership?.approvalStatus, dashboard.membership?.status, dashboard.player?.approvalStatus, "pending");
}

function getFullName(dashboard: PlayerMeDashboard): string {
  return getFirstText(
    dashboard.user?.fullName,
    dashboard.user?.fullname,
    dashboard.user?.name,
    [dashboard.user?.firstName, dashboard.user?.lastName].filter(Boolean).join(" "),
    "Player"
  );
}

function getGameTag(dashboard: PlayerMeDashboard): string {
  return getFirstText(dashboard.player?.gameTag, dashboard.player?.gamerTag, "No game tag");
}

function getCurrentXp(dashboard: PlayerMeDashboard): number {
  return dashboard.player?.currentXp ?? dashboard.player?.xp ?? 0;
}

function getStandingRows(dashboard: PlayerMeDashboard, standing?: PlayerMeStanding | null): Array<{ label: string; value: string }> {
  return [
    { label: "Group Name", value: dashboard.group?.name ?? "Not assigned" },
    { label: "Group Number", value: String(dashboard.group?.number ?? dashboard.group?.groupNumber ?? "Not assigned") },
    {
      label: "Group Capacity",
      value: dashboard.group ? `${dashboard.group.currentPlayers ?? dashboard.group.playerCount ?? 0} / ${dashboard.group.maxPlayers ?? dashboard.group.capacity ?? 0}` : "Not assigned"
    },
    { label: "Points", value: String(standing?.points ?? 0) },
    { label: "Wins", value: String(standing?.wins ?? 0) },
    { label: "Losses", value: String(standing?.losses ?? 0) },
    { label: "Draws", value: String(standing?.draws ?? 0) },
    { label: "Matches Played", value: String(standing?.matchesPlayed ?? getMatchesPlayed(standing)) },
    { label: "Score Difference", value: String(standing?.scoreDifference ?? standing?.scoreDiff ?? 0) }
  ];
}

function getMatchesPlayed(standing?: PlayerMeStanding | null): number {
  return (standing?.wins ?? 0) + (standing?.losses ?? 0) + (standing?.draws ?? 0);
}

function getLeaderboardName(entry: GroupLeaderboardEntry): string {
  return getFirstText(entry.gameTag, entry.gamerTag, entry.player?.gameTag, entry.player?.gamerTag, entry.fullName, entry.user?.fullName, entry.user?.name, "Player");
}

function isCurrentEntry(entry: GroupLeaderboardEntry, playerId?: string, userId?: string): boolean {
  return Boolean(
    (playerId && (entry.playerId === playerId || entry.player?.id === playerId)) ||
      (userId && (entry.userId === userId || entry.user?.id === userId || entry.player?.userId === userId))
  );
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

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

const Header = styled.div`
  display: grid;
  gap: 0.7rem;

  h1 {
    margin: 0;
    font-size: clamp(2rem, 7vw, 4.25rem);
    line-height: 0.95;
  }
`;

const StatusCard = styled(Card)`
  background:
    linear-gradient(135deg, rgba(212, 175, 55, 0.18), rgba(255, 255, 255, 0.03) 44%),
    ${({ theme }) => theme.colors.surfaceElevated};
`;

const CurrentMatchPanel = styled(Card)`
  border-color: ${({ theme }) => theme.colors.borderStrong};
`;

const CurrentMatchContent = styled.div`
  display: grid;
  gap: 1rem;

  h2,
  p {
    margin: 0;
  }

  h2 {
    margin-top: 0.2rem;
    font-size: 1.35rem;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }
`;

const MatchEyebrow = styled.span`
  color: ${({ theme }) => theme.colors.gold};
  font-size: 0.74rem;
  font-weight: 900;
  text-transform: uppercase;
`;

const MatchAction = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  border-radius: 8px;
  padding: 0 1rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.gold}, #8d6d16);
  color: #090909;
  box-shadow: ${({ theme }) => theme.shadows.glowGold};
  font-weight: 900;
`;

const StatusContent = styled.div`
  display: grid;
  gap: 1.25rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 1fr) minmax(16rem, 0.36fr);
    align-items: end;
  }

  h2 {
    margin: 0.85rem 0 0.45rem;
    font-size: clamp(1.55rem, 4vw, 2.7rem);
    line-height: 1;
  }

  p {
    max-width: 42rem;
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const PlayerSummary = styled.div`
  min-width: 0;
  display: grid;
  gap: 0.35rem;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 8px;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.24);

  span,
  small {
    color: ${({ theme }) => theme.colors.textMuted};
    font-weight: 800;
  }

  strong {
    color: ${({ theme }) => theme.colors.gold};
    font-size: 1.7rem;
    line-height: 1;
    overflow-wrap: anywhere;
  }
`;

const SeasonGrid = styled.div`
  display: grid;
  gap: 0.85rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
  }
`;

const StatsGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
`;

const StandingGrid = styled.div`
  display: grid;
  gap: 0.85rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const InfoTile = styled.div`
  min-width: 0;
  min-height: 6.5rem;
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
    font-size: 1.2rem;
    line-height: 1.1;
    overflow-wrap: break-word;
  }
`;

const LeaderboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;

  th,
  td {
    padding: 0.9rem 0.8rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  th {
    color: ${({ theme }) => theme.colors.textDim};
    font-size: 0.74rem;
    text-transform: uppercase;
  }

  td {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const LeaderboardRow = styled.tr<{ $highlight: boolean }>`
  background: ${({ $highlight, theme }) => ($highlight ? theme.colors.goldSoft : "transparent")};
  box-shadow: ${({ $highlight }) => ($highlight ? "inset 3px 0 0 rgba(212, 175, 55, 0.9)" : "none")};

  td {
    color: ${({ $highlight, theme }) => ($highlight ? theme.colors.text : theme.colors.textMuted)};
    font-weight: ${({ $highlight }) => ($highlight ? 900 : 600)};
  }
`;

const InlineState = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
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
