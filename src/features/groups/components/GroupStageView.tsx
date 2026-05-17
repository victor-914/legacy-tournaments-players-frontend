"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { LeaderboardTable } from "@/components/ui/LeaderboardTable";
import { LiveFeed } from "@/components/ui/LiveFeed";
import { PageLoader } from "@/components/ui/PageLoader";
import { Grid, PageStack, SectionTitle, SplitGrid, TableScroller } from "@/components/ui/PagePrimitives";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { activity } from "@/constants/mockData";
import { mockApi } from "@/services/mockApi";

export function GroupStageView() {
  const { data, isLoading } = useQuery({ queryKey: ["standings"], queryFn: mockApi.getStandings });

  if (isLoading || !data) {
    return <PageLoader label="Loading group stage" />;
  }

  return (
    <PageStack>
      <Grid $columns={4}>
        <Card><CardBody><Badge label="Cycle 7" tone="gold" /><h2>Current Cycle</h2></CardBody></Card>
        <Card><CardBody><Badge label="Group A" tone="blue" /><h2>Group Name</h2></CardBody></Card>
        <Card><CardBody><Badge label="TOP 2" tone="green" /><h2>Slots</h2></CardBody></Card>
        <Card><CardBody><Badge label="19h 42m" tone="red" /><h2>Time Remaining</h2></CardBody></Card>
      </Grid>
      <ProgressBar value={72} label="Group stage intensity" />
      <SplitGrid>
        <Card>
          <CardBody>
            <SectionTitle>
              <div>
                <h2>Live Standings</h2>
                <p>Every verified score can move the qualification line.</p>
              </div>
            </SectionTitle>
            <TableScroller>
              <LeaderboardTable standings={data} />
            </TableScroller>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <SectionTitle>
              <div>
                <h2>Qualification Alerts</h2>
                <p>Match activity, submissions, and pressure changes.</p>
              </div>
            </SectionTitle>
            <LiveFeed items={activity} />
          </CardBody>
        </Card>
      </SplitGrid>
    </PageStack>
  );
}
