"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import styled from "styled-components";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { LeaderboardTable } from "@/components/ui/LeaderboardTable";
import { LiveFeed } from "@/components/ui/LiveFeed";
import { PageLoader } from "@/components/ui/PageLoader";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Grid, PageStack, SectionTitle, SplitGrid, TableScroller } from "@/components/ui/PagePrimitives";
import { mockApi } from "@/services/mockApi";
import { formatNumber } from "@/utils/format";

export function DashboardView() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: mockApi.getDashboard });

  if (isLoading || !data) {
    return <PageLoader label="Syncing player dashboard" />;
  }

  const cards = [
    ["Weekly Ranking", `#${data.weeklyRank}`],
    ["Current Group", data.currentGroup],
    ["XP Progress", formatNumber(data.player.xp)],
    ["Win Streak", `${data.player.streak} wins`],
    ["Upcoming Match", data.upcomingMatch.opponent.gamerTag],
    ["Recent Results", data.recentResults.join("  ")],
    ["Group Standing", `#${data.standings[0].rank}`],
    ["Qualification", "Pressure rising"]
  ];

  return (
    <PageStack>
      <Hero as={motion.section} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <CardBody>
          <HeroGrid>
            <Identity>
              <Image src={data.player.avatarUrl} alt="" width={92} height={92} />
              <div>
                <Badge status={data.player.qualificationStatus} />
                <h1>{data.player.gamerTag}</h1>
                <p>{data.player.rank} / Level {data.player.level} / {formatNumber(data.player.xp)} XP</p>
              </div>
            </Identity>
            <ProgressBar value={data.qualificationProgress} label={`${data.season} ${data.cycle} qualification`} />
          </HeroGrid>
        </CardBody>
      </Hero>

      <Grid $columns={4}>
        {cards.map(([label, value]) => (
          <Metric key={label}>
            <CardBody>
              <span>{label}</span>
              <strong>{value}</strong>
            </CardBody>
          </Metric>
        ))}
      </Grid>

      <SplitGrid>
        <Card>
          <CardBody>
            <SectionTitle>
              <div>
                <h2>Group Standings</h2>
                <p>Live group pressure with qualification line</p>
              </div>
            </SectionTitle>
            <TableScroller>
              <LeaderboardTable standings={data.standings} />
            </TableScroller>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <SectionTitle>
              <div>
                <h2>Live Activity</h2>
                <p>Verification, XP, and qualification updates</p>
              </div>
            </SectionTitle>
            <LiveFeed items={data.activity} />
          </CardBody>
        </Card>
      </SplitGrid>

      <Grid $columns={3}>
        {data.standings.slice(0, 3).map((standing) => (
          <PlayerCard key={standing.player.id} player={standing.player} highlight={standing.rank === 1} rankLabel={`Rank ${standing.rank}`} />
        ))}
      </Grid>
    </PageStack>
  );
}

const Hero = styled(Card)`
  min-height: 18rem;
  display: grid;
  align-items: end;
  background:
    linear-gradient(135deg, rgba(212, 175, 55, 0.16), rgba(58, 134, 255, 0.08)),
    ${({ theme }) => theme.colors.surfaceElevated};
`;

const HeroGrid = styled.div`
  display: grid;
  gap: 1.5rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr 22rem;
    align-items: end;
  }
`;

const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  img {
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    background: ${({ theme }) => theme.colors.surfaceGlass};
  }

  h1 {
    margin: 0.55rem 0 0.25rem;
    font-size: clamp(2rem, 7vw, 4.4rem);
    line-height: 0.95;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Metric = styled(Card)`
  min-height: 7rem;

  span {
    color: ${({ theme }) => theme.colors.textDim};
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 900;
  }

  strong {
    display: block;
    margin-top: 0.55rem;
    font-size: 1.4rem;
  }
`;
