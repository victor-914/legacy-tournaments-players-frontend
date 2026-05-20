"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import styled from "styled-components";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/PageLoader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Grid, PageStack, SectionTitle } from "@/components/ui/PagePrimitives";
import { mockApi } from "@/services/mockApi";
import { QualificationStatus, type DashboardSummary, type Standing } from "@/types/domain";

type ChampionshipStatus = "qualified" | "not_qualified" | "eliminated" | "pending_review";

export function DashboardView() {
  const {
    data,
    isError,
    isLoading
  } = useQuery({ queryKey: ["dashboard"], queryFn: mockApi.getDashboard });

  if (isLoading) {
    return <PageLoader label="Loading Championship Dashboard" />;
  }

  if (isError) {
    return (
      <PageStack>
        <Header>
          <Badge label="Dashboard" tone="gold" />
          <h1>Dashboard</h1>
        </Header>
        <EmptyCard>
          <CardBody>
            <strong>Dashboard unavailable</strong>
            <p>We could not load your championship details right now.</p>
          </CardBody>
        </EmptyCard>
      </PageStack>
    );
  }

  const dashboard = normalizeDashboard(data);
  const standing = dashboard.standings.find((item) => item.player.id === dashboard.player.id);
  const championshipStatus = getChampionshipStatus(dashboard.player.qualificationStatus);

  return (
    <PageStack>


      <StatusCard as={motion.section} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <CardBody>
          <StatusContent>
            <div>
              <Badge label={statusMeta[championshipStatus].badge} tone={statusMeta[championshipStatus].tone} />
              <h2>{statusMeta[championshipStatus].title}</h2>
              <p>{statusMeta[championshipStatus].helper}</p>
            </div>
       
          </StatusContent>
        </CardBody>
      </StatusCard>

      <Grid $columns={2}>
        <Card>
          <CardBody>
            <SectionTitle>
              <div>
                <h2>Current Season / Current Cycle</h2>
                <p>Active championship qualification window</p>
              </div>
            </SectionTitle>
            <SeasonGrid>
              <InfoTile>
                <span>Season</span>
                <strong>{dashboard.season}</strong>
              </InfoTile>
              <InfoTile>
                <span>Cycle</span>
                <strong>{dashboard.cycle}</strong>
              </InfoTile>
            </SeasonGrid>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <SectionTitle>
              <div>
                <h2>Season Progress</h2>
                <p>Cycle progress</p>
              </div>
            </SectionTitle>
            <ProgressBar value={dashboard.progress} label={`${dashboard.cycle} progress`} />
          </CardBody>
        </Card>
      </Grid>

      <Card>
        <CardBody>
          <SectionTitle>
            <div>
              <h2>Group Stage Standing</h2>
              <p>Current group stage performance</p>
            </div>
          </SectionTitle>
          <StandingGrid>
            {getStandingRows(dashboard.currentGroup, standing).map((item) => (
              <InfoTile key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </InfoTile>
            ))}
          </StandingGrid>
        </CardBody>
      </Card>
    </PageStack>
  );
}

const statusMeta: Record<
  ChampionshipStatus,
  { badge: string; helper: string; title: string; tone: "gold" | "green" | "red" | "blue" }
> = {
  qualified: {
    badge: "Qualified",
    helper: "You have met the required group stage performance.",
    title: "Qualified for Championship",
    tone: "green"
  },
  not_qualified: {
    badge: "Not qualified",
    helper: "Complete the required group stage performance to qualify.",
    title: "Not qualified for Championship yet",
    tone: "gold"
  },
  eliminated: {
    badge: "Eliminated",
    helper: "Your current championship path has ended for this cycle.",
    title: "Eliminated",
    tone: "red"
  },
  pending_review: {
    badge: "Pending review",
    helper: "Your group stage performance is being reviewed.",
    title: "Pending Review",
    tone: "blue"
  }
};

function normalizeDashboard(data?: DashboardSummary) {
  return {
    currentGroup: data?.currentGroup || "Not available yet",
    cycle: data?.cycle || "Cycle 7",
    player: data?.player ?? {
      avatarUrl: "",
      gamerTag: "Player",
      id: "unknown-player",
      level: 0,
      qualificationStatus: QualificationStatus.InGroupStage,
      rank: "Unranked",
      streak: 0,
      winRate: 0,
      xp: 0
    },
    // TODO: Replace this with a dedicated season/cycle progress field when the API exposes one.
    progress: data?.qualificationProgress ?? 0,
    season: data?.season || "Season 1",
    standings: data?.standings ?? []
  };
}

function getChampionshipStatus(status: QualificationStatus): ChampionshipStatus {
  if (status === QualificationStatus.Qualified || status === QualificationStatus.GrandFinaleQualified) {
    return "qualified";
  }

  if (status === QualificationStatus.Eliminated) {
    return "eliminated";
  }

  if (status === QualificationStatus.AtRisk) {
    return "pending_review";
  }

  return "not_qualified";
}

function getStandingRows(group: string, standing?: Standing): Array<{ label: string; value: string }> {
  const empty = "Not available yet";

  return [
    { label: "Group", value: group || empty },
    { label: "Rank", value: standing ? `#${standing.rank}` : empty },
    { label: "Matches Played", value: standing ? `${standing.wins + standing.losses}` : empty },
    { label: "Wins", value: standing ? `${standing.wins}` : empty },
    { label: "Losses", value: standing ? `${standing.losses}` : empty },
    { label: "Points", value: standing ? `${standing.points}` : empty }
  ];
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

const StatusContent = styled.div`
  display: grid;
  gap: 1.25rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.42fr);
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

const SeasonBlock = styled.div`
  display: grid;
  gap: 0.35rem;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 8px;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.24);

  span {
    color: ${({ theme }) => theme.colors.textDim};
    font-size: 0.75rem;
    font-weight: 900;
    text-transform: uppercase;
  }

  strong {
    color: ${({ theme }) => theme.colors.gold};
    font-size: clamp(1.3rem, 4vw, 2rem);
  }
`;

const SeasonGrid = styled.div`
  display: grid;
  gap: 0.85rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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
    font-size: 1.35rem;
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
