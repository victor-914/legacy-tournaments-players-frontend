"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Grid, PageStack, SectionTitle } from "@/components/ui/PagePrimitives";
import { PageLoader } from "@/components/ui/PageLoader";
import { Tabs } from "@/components/ui/Tabs";
import { TournamentCard } from "@/components/ui/TournamentCard";
import { mockApi } from "@/services/mockApi";
import { TournamentStatus } from "@/types/domain";

const tabs = [
  { label: "Live", value: TournamentStatus.Live },
  { label: "Weekly Group Stage", value: TournamentStatus.WeeklyGroupStage },
  { label: "Grand Finale", value: TournamentStatus.GrandFinale },
  { label: "Completed", value: TournamentStatus.Completed }
];

export function TournamentsView() {
  const [active, setActive] = useState<TournamentStatus>(TournamentStatus.Live);
  const { data, isLoading } = useQuery({ queryKey: ["tournaments"], queryFn: mockApi.getTournaments });

  if (isLoading || !data) {
    return <PageLoader label="Loading tournaments" />;
  }

  const filtered = data.filter((tournament) => tournament.status === active);

  return (
    <PageStack>
      <SectionTitle>
        <div>
          <h2>Tournaments</h2>
          <p>Weekly cycles, group stages, and championship qualification.</p>
        </div>
      </SectionTitle>
      <Tabs tabs={tabs} active={active} onChange={setActive} />
      <Grid $columns={3}>
        {filtered.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </Grid>
    </PageStack>
  );
}
