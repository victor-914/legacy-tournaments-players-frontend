"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock3, Shield, Trophy } from "lucide-react";
import styled, { css } from "styled-components";
import { Card, CardBody } from "@/components/ui/Card";
import { ApprovalNotice } from "@/components/auth/ApprovalNotice";
import { LeaderboardTable } from "@/components/ui/LeaderboardTable";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageStack, SectionTitle, TableScroller } from "@/components/ui/PagePrimitives";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { mockApi } from "@/services/mockApi";
import { playerService } from "@/services/playerService";
import { isApprovedPlayer } from "@/utils/approval";

const groupStageStats = [
  { label: "Current Cycle", value: "Cycle 7", helper: "Active weekly run", icon: CalendarDays, tone: "gold" },
  { label: "Group Name", value: "Group A", helper: "Assigned pool", icon: Shield, tone: "blue" },
  { label: "Slots", value: "Top 5", helper: "Advance onward", icon: Trophy, tone: "green" },
  { label: "Time Remaining", value: "19h 42m", helper: "Before lock", icon: Clock3, tone: "red" }
] as const;

export function GroupStageView() {
  const meQuery = useQuery({ queryKey: ["players-me"], queryFn: playerService.getMe });
  const approved = isApprovedPlayer(meQuery.data);
  const { data, isLoading } = useQuery({ queryKey: ["standings"], queryFn: mockApi.getStandings, enabled: approved });

  if (meQuery.isLoading || isLoading || (approved && !data)) {
    return <PageLoader label="Loading group stage" />;
  }

  if (!approved) {
    return (
      <PageStack>
        <ApprovalNotice />
      </PageStack>
    );
  }

  return (
    <PageStack>
      <StatsGrid>
        {groupStageStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <StatCard key={stat.label} $tone={stat.tone}>
              <StatBody>
                <StatIcon $tone={stat.tone}>
                  <Icon size={18} strokeWidth={2.4} />
                </StatIcon>
                <StatContent>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                  <small>{stat.helper}</small>
                </StatContent>
              </StatBody>
            </StatCard>
          );
        })}
      </StatsGrid>
      <ProgressBar value={72} label="Group stage intensity" />
      <Card>
        <CardBody>
          <SectionTitle>
            <div>
              <h2>Live Standings</h2>
              <p>Every verified score can move the qualification line.</p>
            </div>
          </SectionTitle>
          <TableScroller>
            <LeaderboardTable standings={data ?? []} />
          </TableScroller>
        </CardBody>
      </Card>
    </PageStack>
  );
}

type StatTone = (typeof groupStageStats)[number]["tone"];

const toneStyles = {
  gold: css`
    --stat-accent: ${({ theme }) => theme.colors.gold};
    --stat-glow: rgba(212, 175, 55, 0.2);
    --stat-tint: rgba(212, 175, 55, 0.1);
  `,
  blue: css`
    --stat-accent: ${({ theme }) => theme.colors.info};
    --stat-glow: rgba(58, 134, 255, 0.18);
    --stat-tint: rgba(58, 134, 255, 0.1);
  `,
  green: css`
    --stat-accent: ${({ theme }) => theme.colors.success};
    --stat-glow: rgba(0, 200, 83, 0.18);
    --stat-tint: rgba(0, 200, 83, 0.1);
  `,
  red: css`
    --stat-accent: ${({ theme }) => theme.colors.error};
    --stat-glow: rgba(255, 59, 48, 0.18);
    --stat-tint: rgba(255, 59, 48, 0.1);
  `
};

const StatsGrid = styled.div`
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
`;

const StatCard = styled(Card)<{ $tone: StatTone }>`
  ${({ $tone }) => toneStyles[$tone]}
  min-height: 8.25rem;
  border-color: color-mix(in srgb, var(--stat-accent) 32%, ${({ theme }) => theme.colors.border});
  background:
    linear-gradient(145deg, var(--stat-tint), transparent 44%),
    ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.34), 0 0 32px var(--stat-glow);

  &::before {
    background:
      radial-gradient(circle at 82% 12%, var(--stat-glow), transparent 28%),
      linear-gradient(135deg, var(--stat-tint), transparent 42%);
  }
`;

const StatBody = styled(CardBody)`
  display: flex;
  min-height: 8.25rem;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
`;

const StatIcon = styled.div<{ $tone: StatTone }>`
  ${({ $tone }) => toneStyles[$tone]}
  display: inline-flex;
  width: 2.4rem;
  height: 2.4rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--stat-accent) 46%, ${({ theme }) => theme.colors.border});
  border-radius: 8px;
  color: var(--stat-accent);
  background: var(--stat-tint);
`;

const StatContent = styled.div`
  display: grid;
  gap: 0.28rem;
  min-width: 0;
  text-align: right;

  span {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.76rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-size: clamp(1.55rem, 3vw, 2.15rem);
    line-height: 1;
  }

  small {
    color: ${({ theme }) => theme.colors.textDim};
    font-size: 0.84rem;
    font-weight: 700;
  }
`;
