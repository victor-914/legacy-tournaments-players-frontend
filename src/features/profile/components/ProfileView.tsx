"use client";

import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { AvatarImage } from "@/components/ui/AvatarImage";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { Grid, PageStack, SectionTitle } from "@/components/ui/PagePrimitives";
import { PageLoader } from "@/components/ui/PageLoader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { mockApi } from "@/services/mockApi";
import { formatNumber } from "@/utils/format";

export function ProfileView() {
  const { data, isLoading } = useQuery({ queryKey: ["profile"], queryFn: mockApi.getProfile });

  if (isLoading || !data) {
    return <PageLoader label="Loading profile" />;
  }

  return (
    <PageStack>
      <Hero>
        <CardBody>
          <AvatarImage src={data.avatarUrl} alt={`${data.gamerTag} avatar`} size={104} />
          <Badge status={data.qualificationStatus} />
          <h1>{data.gamerTag}</h1>
          <p>{data.rank} / Level {data.level} / {formatNumber(data.xp)} XP</p>
          <ProgressBar value={82} label="Level progression" />
        </CardBody>
      </Hero>
      <Grid $columns={4}>
        {[
          ["Win Rate", `${data.winRate}%`],
          ["Win Streak", `${data.streak}`],
          ["Season XP", formatNumber(data.xp)],
          ["Badges", "12"]
        ].map(([label, value]) => (
          <Card key={label}><CardBody><MetricLabel>{label}</MetricLabel><MetricValue>{value}</MetricValue></CardBody></Card>
        ))}
      </Grid>
      <Grid $columns={3}>
        {["Cycle Finalist", "Group Slayer", "Verified Streak", "Elite Qualifier", "No Disputes", "XP Surge"].map((badge) => (
          <Card key={badge}><CardBody><Badge label={badge} tone="gold" /></CardBody></Card>
        ))}
      </Grid>
      <Card>
        <CardBody>
          <SectionTitle>
            <div>
              <h2>Tournament History</h2>
              <p>Recent cycles, group placements, rewards, and qualification movement.</p>
            </div>
          </SectionTitle>
          <History>
            {["Cycle 7 / Group A / Rank 1", "Cycle 6 / Group C / Rank 4", "Cycle 5 / Group B / Rank 2"].map((item) => (
              <li key={item}>{item}<Badge label="Verified" tone="green" /></li>
            ))}
          </History>
        </CardBody>
      </Card>
    </PageStack>
  );
}

const Hero = styled(Card)`
  text-align: center;

  img {
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    background: ${({ theme }) => theme.colors.surfaceGlass};
  }

  h1 {
    margin: 0.7rem 0 0.35rem;
    font-size: clamp(2.4rem, 8vw, 5rem);
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
  font-size: 1.65rem;
`;

const History = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.7rem;

  li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.9rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;
