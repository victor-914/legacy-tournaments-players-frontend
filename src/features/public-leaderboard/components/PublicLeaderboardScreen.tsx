"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { PageStack, SectionTitle } from "@/components/ui/PagePrimitives";
import { PublicGroupLeaderboardView } from "@/features/public-leaderboard/components/PublicGroupLeaderboardView";
import { PublicGroupSelector } from "@/features/public-leaderboard/components/PublicGroupSelector";
import { PublicLeaderboardView } from "@/features/public-leaderboard/components/PublicLeaderboardView";

export function PublicLeaderboardScreen() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  return (
    <PageWrap>
      <TopBar>
        <Brand href="/dashboard">
          <LogoMark>
            <Image src="/legacy_logo.jpeg" alt="Legacy Gaming" width={40} height={40} />
          </LogoMark>
          <span>Legacy Gaming</span>
        </Brand>
      </TopBar>

      <Content>
        <PageStack>
          <PublicLeaderboardView />

          <GroupSection>
            <SectionTitle>
              <div>
                <h2>Group Leaderboards</h2>
                <p>Select a group to see its live standings.</p>
              </div>
            </SectionTitle>
            <PublicGroupSelector selectedGroupId={selectedGroupId} onSelect={setSelectedGroupId} />
            {selectedGroupId ? <PublicGroupLeaderboardView groupId={selectedGroupId} /> : null}
          </GroupSection>
        </PageStack>
      </Content>
    </PageWrap>
  );
}

const PageWrap = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const TopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 4.5rem;
  padding: 0.9rem 1rem;
  background: rgba(11, 11, 11, 0.74);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(18px);

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0.9rem 1.5rem;
  }
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text};
`;

const LogoMark = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  flex: none;
  overflow: hidden;
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.shadows.glowGold};

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

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
