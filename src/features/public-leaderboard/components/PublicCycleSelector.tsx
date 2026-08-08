"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { publicLeaderboardService } from "@/features/public-leaderboard/services/publicLeaderboardService";
import type { PublicCycleSummary } from "@/features/public-leaderboard/types";

interface PublicCycleSelectorProps {
  selectedCycleId: string | null;
  onSelect: (cycle: PublicCycleSummary) => void;
}

const CYCLES_STALE_TIME_MS = 60_000;

export function PublicCycleSelector({ selectedCycleId, onSelect }: PublicCycleSelectorProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-cycles"],
    queryFn: () => publicLeaderboardService.getPublicCycles(),
    staleTime: CYCLES_STALE_TIME_MS
  });

  const cycles = data ?? [];

  useEffect(() => {
    if (selectedCycleId || cycles.length === 0) {
      return;
    }

    const defaultCycle =
      cycles.find((cycle) => cycle.status === "active") ??
      [...cycles].sort((a, b) => b.cycleNumber - a.cycleNumber)[0];

    if (defaultCycle) {
      onSelect(defaultCycle);
    }
  }, [cycles, selectedCycleId, onSelect]);

  if (isLoading) {
    return <Placeholder>Loading cycles...</Placeholder>;
  }

  if (isError) {
    return <Placeholder>Cycles unavailable</Placeholder>;
  }

  if (cycles.length <= 1) {
    return null;
  }

  return (
    <TabList role="tablist" aria-label="Cycles">
      {cycles.map((cycle) => (
        <TabButton
          key={cycle.id}
          type="button"
          role="tab"
          aria-selected={cycle.id === selectedCycleId}
          data-active={cycle.id === selectedCycleId}
          $muted={cycle.status !== "active"}
          onClick={() => onSelect(cycle)}
        >
          {cycle.name || `Cycle ${cycle.cycleNumber}`}
        </TabButton>
      ))}
    </TabList>
  );
}

const TabList = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-wrap: wrap;
    overflow-x: visible;
    padding-bottom: 0;
    gap: 0.6rem;
  }
`;

const TabButton = styled.button<{ $muted: boolean }>`
  flex: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  padding: 0.5rem 0.85rem;
  background: ${({ theme }) => theme.colors.surfaceGlass};
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 800;
  font-size: 0.78rem;
  cursor: pointer;
  transition: ${({ theme }) => theme.animations.fast};
  opacity: ${({ $muted }) => ($muted ? 0.6 : 1)};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 0.55rem 1rem;
    font-size: 0.82rem;
  }

  &[data-active="true"] {
    color: ${({ theme }) => theme.colors.gold};
    background: ${({ theme }) => theme.colors.goldSoft};
    border-color: ${({ theme }) => theme.colors.borderStrong};
    box-shadow: ${({ theme }) => theme.shadows.glowGold};
    opacity: 1;
  }
`;

const Placeholder = styled.div`
  padding: 0.9rem;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.86rem;
`;
