"use client";

import { useState } from "react";
import styled from "styled-components";
import { PublicShell } from "@/components/public/PublicShell";
import { PageStack, SectionTitle } from "@/components/ui/PagePrimitives";
import { PublicCycleSelector } from "@/features/public-leaderboard/components/PublicCycleSelector";
import { PublicGroupLeaderboardView } from "@/features/public-leaderboard/components/PublicGroupLeaderboardView";
import { PublicGroupSelector } from "@/features/public-leaderboard/components/PublicGroupSelector";
import { PublicLeaderboardView } from "@/features/public-leaderboard/components/PublicLeaderboardView";
import type { PublicCycleSummary } from "@/features/public-leaderboard/types";

export function PublicLeaderboardScreen() {
  const [selectedCycle, setSelectedCycle] = useState<PublicCycleSummary | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  function handleSelectCycle(cycle: PublicCycleSummary) {
    if (cycle.id === selectedCycle?.id) {
      return;
    }

    setSelectedCycle(cycle);
    // A group id from the previous cycle must not carry over — different cycles
    // have entirely different groups.
    setSelectedGroupId(null);
  }

  return (
    <PublicShell>
      <Content>
        <PageStack>
          <PublicLeaderboardView />

          <GroupSection>
            <SectionTitle>
              <div>
                <h2>Group Leaderboards</h2>
                <p>Select a cycle and group to see its standings.</p>
              </div>
            </SectionTitle>
            <PublicCycleSelector selectedCycleId={selectedCycle?.id ?? null} onSelect={handleSelectCycle} />
            <PublicGroupSelector
              // Omit cycleId for the active cycle (including before cycles have
              // loaded) so this reuses the same "public-groups" cache entry the
              // page's initial, cycle-agnostic fetch already primed — only a
              // genuinely past cycle needs its own explicit cache key.
              cycleId={selectedCycle && selectedCycle.status !== "active" ? selectedCycle.id : null}
              selectedGroupId={selectedGroupId}
              onSelect={setSelectedGroupId}
            />
            {selectedGroupId ? (
              <PublicGroupLeaderboardView
                groupId={selectedGroupId}
                isActiveCycle={selectedCycle ? selectedCycle.status === "active" : true}
              />
            ) : null}
          </GroupSection>
        </PageStack>
      </Content>
    </PublicShell>
  );
}

const Content = styled.div`
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: 1rem 1rem 3rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 1.5rem 1.5rem 3.5rem;
  }
`;

const GroupSection = styled.div`
  display: grid;
  gap: 1rem;
`;
