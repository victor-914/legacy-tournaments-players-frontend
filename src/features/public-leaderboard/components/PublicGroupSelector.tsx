"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { publicLeaderboardService } from "@/features/public-leaderboard/services/publicLeaderboardService";

interface PublicGroupSelectorProps {
  selectedGroupId: string | null;
  onSelect: (groupId: string) => void;
}

export function PublicGroupSelector({ selectedGroupId, onSelect }: PublicGroupSelectorProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-groups"],
    queryFn: () => publicLeaderboardService.getPublicGroups()
  });

  const groups = data ?? [];

  useEffect(() => {
    if (!selectedGroupId && groups.length > 0) {
      onSelect(groups[0].id);
    }
  }, [groups, selectedGroupId, onSelect]);

  if (isLoading) {
    return <Placeholder>Loading groups...</Placeholder>;
  }

  if (isError) {
    return <Placeholder>Groups unavailable</Placeholder>;
  }

  if (groups.length === 0) {
    return <Placeholder>No active groups yet.</Placeholder>;
  }

  return (
    <TabList role="tablist" aria-label="Groups">
      {groups.map((group) => (
        <TabButton
          key={group.id}
          type="button"
          role="tab"
          aria-selected={group.id === selectedGroupId}
          data-active={group.id === selectedGroupId}
          onClick={() => onSelect(group.id)}
        >
          {group.name || `Group ${group.groupNumber}`}
        </TabButton>
      ))}
    </TabList>
  );
}

const TabList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const TabButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  padding: 0.55rem 1rem;
  background: ${({ theme }) => theme.colors.surfaceGlass};
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 800;
  font-size: 0.82rem;
  cursor: pointer;
  transition: ${({ theme }) => theme.animations.fast};

  &[data-active="true"] {
    color: ${({ theme }) => theme.colors.gold};
    background: ${({ theme }) => theme.colors.goldSoft};
    border-color: ${({ theme }) => theme.colors.borderStrong};
    box-shadow: ${({ theme }) => theme.shadows.glowGold};
  }
`;

const Placeholder = styled.div`
  padding: 0.9rem;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.86rem;
`;
