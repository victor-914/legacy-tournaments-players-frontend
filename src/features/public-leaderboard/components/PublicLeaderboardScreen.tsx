"use client";

import { useState } from "react";
import styled from "styled-components";
import { PublicShell } from "@/components/public/PublicShell";
import { PageStack } from "@/components/ui/PagePrimitives";
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
            <GroupHeading>
              <span>Group stage</span>
              <h2>Group Leaderboards</h2>
              <p>Pick a cycle, then a group, to see its full standings.</p>
            </GroupHeading>
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

const GroupSection = styled.section`
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const GroupHeading = styled.div`
  display: grid;
  gap: 0.4rem;

  span {
    color: ${({ theme }) => theme.colors.gold};
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    font-family: ${({ theme }) => theme.typography.displayFontFamily};
    font-weight: 400;
    font-size: clamp(1.8rem, 5vw, 2.6rem);
    line-height: 1;
    text-transform: uppercase;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;
