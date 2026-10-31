"use client";

import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";
import { PublicGroupLeaderboardView } from "@/features/public-leaderboard/components/PublicGroupLeaderboardView";
import { useChampionshipState } from "@/features/championship/hooks/useChampionship";
import { ChampionshipChrome, ClassChip, GroupsBoard, Muted, Panel, PanelTitle } from "@/features/championship/components/ChampionshipChrome";
import { DrawReveal } from "@/features/championship/components/DrawReveal";
import type { ChampionshipState } from "@/features/championship/types";

const STATUS_COPY: Record<string, string> = {
  draft: "Qualifiers are being confirmed",
  roster_locked: "Seeding locked · draw starting soon",
  drawing: "Live draw in progress",
  complete: "Draw complete · groups being published",
  published: "Group stage under way"
};

export function ChampionshipScreen() {
  const { data: state, isLoading, isError } = useChampionshipState();

  return (
    <ChampionshipChrome
      eyebrow={state ? `${state.cycleName} · ${STATUS_COPY[state.status] ?? state.status}` : "Battle Season Championship"}
      title="The draw is"
      accent={state?.status === "published" ? "done" : "live"}
      intro="The season's qualifiers are seeded into three pots and drawn live into six groups of fifteen. Every player plays everyone in their group once; the top ten in each group and the best four eleventh-placed players reach the Round of 64."
    >
      {isLoading ? <Muted>Loading the championship…</Muted> : null}
      {isError ? <Muted>Could not load the championship right now.</Muted> : null}
      {!isLoading && !state ? (
        <Panel>
          <PanelTitle>Championship</PanelTitle>
          <Muted>The championship has not been scheduled yet. Qualify through the season&apos;s cycles to earn a place.</Muted>
        </Panel>
      ) : null}
      {state ? (state.status === "published" ? <GroupStage state={state} /> : <LiveDraw state={state} />) : null}
    </ChampionshipChrome>
  );
}

function LiveDraw({ state }: { state: ChampionshipState }) {
  const [fullscreen, setFullscreen] = useState(false);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setFullscreen(false);
      } else {
        await document.documentElement.requestFullscreen();
        setFullscreen(true);
      }
    } catch {
      setFullscreen(false);
    }
  };
  const progress = state.total ? Math.round((state.revealedCount / state.total) * 100) : 0;

  return (
    <>
      <ProgressRow>
        <div>
          <strong>
            {state.revealedCount}/{state.total || 90}
          </strong>{" "}
          players drawn
        </div>
        <Pots>
          {Object.entries(state.remainingByPot).map(([pot, left]) => (
            <span key={pot}>
              Pot {pot}: <b>{left}</b>
            </span>
          ))}
        </Pots>
        <FullscreenButton type="button" onClick={() => void toggleFullscreen()}>
          {fullscreen ? "Exit fullscreen" : "Fullscreen"}
        </FullscreenButton>
      </ProgressRow>
      <Bar aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </Bar>

      <Layout>
        <DrawReveal current={state.current} status={state.status} total={state.total} drawn={state.revealedCount} />
        <Panel>
          <PanelTitle>Recent picks</PanelTitle>
          {state.recent.length === 0 ? <Muted>No players drawn yet.</Muted> : null}
          <Recent>
            {state.recent.map((pick) => (
              <li key={pick.order}>
                <span className="order">{String(pick.order).padStart(2, "0")}</span>
                <ClassChip value={pick.drawClass} />
                <span className="name">{pick.gameTag}</span>
                <span className="group">{pick.group}</span>
              </li>
            ))}
          </Recent>
        </Panel>
      </Layout>

      <Panel>
        <PanelTitle>Group allocation · 15 per group · 5 from each pot</PanelTitle>
        <GroupsBoard groups={state.groups} highlightGroup={state.current?.stage === "group" ? state.current.group : undefined} />
      </Panel>
    </>
  );
}

function GroupStage({ state }: { state: ChampionshipState }) {
  const letters = Object.keys(state.groupIds).sort();
  const [letter, setLetter] = useState(letters[0] ?? "A");
  const groupId = state.groupIds[letter];

  return (
    <>
      <Panel>
        <PanelTitle>Live group standings</PanelTitle>
        <GroupTabs role="tablist">
          {letters.map((item) => (
            <button key={item} type="button" role="tab" aria-selected={item === letter} data-active={item === letter} onClick={() => setLetter(item)}>
              Group {item}
            </button>
          ))}
        </GroupTabs>
        <Muted>
          Top {state.preset.autoQualifiersPerGroup} qualify automatically · {state.preset.wildcardPosition}th place enters the wildcard race (best{" "}
          {state.preset.wildcardCount} of {state.preset.groups} advance). <Link href="/championship/bracket">See where each finish leads →</Link>
        </Muted>
        {groupId ? <PublicGroupLeaderboardView groupId={groupId} /> : null}
      </Panel>
      <Panel>
        <PanelTitle>Draw result</PanelTitle>
        <GroupsBoard groups={state.groups} />
      </Panel>
    </>
  );
}

const ProgressRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.25rem;
  color: ${({ theme }) => theme.colors.textMuted};

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-size: 1.3rem;
    font-variant-numeric: tabular-nums;
  }
`;

const Pots = styled.div`
  display: flex;
  gap: 0.9rem;
  font-size: 0.9rem;

  b {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const FullscreenButton = styled.button`
  margin-left: auto;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
`;

const Bar = styled.div`
  height: 0.35rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;

  span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #8a6a12, #d4af37, #fff1b8);
    transition: width 0.6s ease;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Recent = styled.ol`
  display: grid;
  gap: 0.3rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
  }

  .order {
    color: ${({ theme }) => theme.colors.textDim};
    font-variant-numeric: tabular-nums;
  }

  .name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .group {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const GroupTabs = styled.div`
  display: flex;
  gap: 0.35rem;
  overflow-x: auto;
  margin-bottom: 0.75rem;

  button {
    flex: none;
    padding: 0.45rem 0.85rem;
    border-radius: 999px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: transparent;
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: pointer;
  }

  button[data-active="true"] {
    border-color: ${({ theme }) => theme.colors.borderStrong};
    color: ${({ theme }) => theme.colors.gold};
    background: ${({ theme }) => theme.colors.goldSoft};
  }
`;
