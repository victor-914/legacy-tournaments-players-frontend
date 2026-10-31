"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import { useChampionshipBracket, useChampionshipState } from "@/features/championship/hooks/useChampionship";
import { ChampionshipChrome, ClassChip, Muted, Panel, PanelTitle } from "@/features/championship/components/ChampionshipChrome";
import { CLASS_TIERS } from "@/features/championship/types";

const ordinal = (value: number) => {
  const suffix = value % 10 === 1 && value !== 11 ? "st" : value % 10 === 2 && value !== 12 ? "nd" : value % 10 === 3 && value !== 13 ? "rd" : "th";
  return `${value}${suffix}`;
};

export function PlayerRoutesScreen() {
  const { data: state } = useChampionshipState();
  const { data: bracket } = useChampionshipBracket(state?.cycleId);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const groupByUser = useMemo(() => {
    const map = new Map<string, string>();
    Object.entries(state?.groups ?? {}).forEach(([letter, picks]) =>
      picks.forEach((pick) => pick.userId && map.set(pick.userId, letter))
    );
    return map;
  }, [state]);

  const roster = state?.roster ?? [];
  const filtered = roster.filter((row) => row.gameTag.toLowerCase().includes(search.trim().toLowerCase()));
  const selected = roster.find((row) => row.userId === selectedId) ?? filtered[0] ?? null;
  const selectedGroup = selected ? groupByUser.get(selected.userId) : undefined;
  const preset = state?.preset;

  return (
    <ChampionshipChrome
      eyebrow="Battle Season ranks · player routes"
      title="Every player's"
      accent="path"
      intro="Seeding uses total points across the season's qualifying cycles. Pick a player to see their class, pot, group and where each possible group finish would send them."
    >
      {!state ? <Muted>The championship has not been scheduled yet.</Muted> : null}
      {state && roster.length === 0 ? (
        <Panel>
          <Muted>The qualifier ranking is published once the roster is locked.</Muted>
        </Panel>
      ) : null}
      {roster.length > 0 ? (
        <Layout>
          <Panel>
            <PanelTitle>Season ranks</PanelTitle>
            <Search placeholder="Search player" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search player" />
            <List>
              {filtered.map((row) => (
                <li key={row.userId}>
                  <button type="button" data-active={selected?.userId === row.userId} onClick={() => setSelectedId(row.userId)}>
                    <span className="rank">#{row.seasonRank}</span>
                    <ClassChip value={row.drawClass} />
                    <span className="name">{row.gameTag}</span>
                    <span className="group">{groupByUser.get(row.userId) ?? "–"}</span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 ? <Muted>No player matches that search.</Muted> : null}
            </List>
          </Panel>

          {selected ? (
            <Panel>
              <PanelTitle>{selected.gameTag}</PanelTitle>
              <Facts>
                <div>
                  <span>Class</span>
                  <b>
                    {selected.drawClass} · {CLASS_TIERS[selected.drawClass] ?? ""}
                  </b>
                </div>
                <div>
                  <span>Season rank</span>
                  <b>#{selected.seasonRank}</b>
                </div>
                <div>
                  <span>Pot</span>
                  <b>{selected.pot}</b>
                </div>
                <div>
                  <span>Group</span>
                  <b>{selectedGroup ?? "Not drawn yet"}</b>
                </div>
                <div>
                  <span>Points</span>
                  <b>{selected.points}</b>
                </div>
                <div>
                  <span>Wins</span>
                  <b>{selected.wins}</b>
                </div>
                <div>
                  <span>Qualified in</span>
                  <b>Cycle {selected.sourceCycleNumber}</b>
                </div>
              </Facts>

              {selectedGroup && preset ? (
                <>
                  <PanelTitle>Where each finish leads</PanelTitle>
                  <Routes>
                    {Array.from({ length: preset.playersPerGroup }).map((_, index) => {
                      const position = index + 1;
                      const slot = bracket?.slots.find((item) => item.originGroup === selectedGroup && item.originPosition === position);
                      const auto = position <= preset.autoQualifiersPerGroup;
                      const wildcard = position === preset.wildcardPosition;
                      return (
                        <li key={position} data-tone={auto ? "in" : wildcard ? "wild" : "out"}>
                          <span className="pos">{ordinal(position)}</span>
                          <span className="what">
                            {auto
                              ? "Qualifies automatically"
                              : wildcard
                                ? `Wildcard race · best ${preset.wildcardCount} of ${preset.groups} advance`
                                : "Eliminated at the group stage"}
                          </span>
                          <span className="slot">{slot ? `R64 M${slot.match} · ${slot.side === 1 ? "top" : "bottom"}` : "—"}</span>
                        </li>
                      );
                    })}
                  </Routes>
                </>
              ) : (
                <Muted>Routes appear once this player has been drawn into a group.</Muted>
              )}
            </Panel>
          ) : null}
        </Layout>
      ) : null}
    </ChampionshipChrome>
  );
}

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Search = styled.input`
  width: 100%;
  margin-bottom: 0.6rem;
  padding: 0.6rem 0.8rem;
  border-radius: 0.6rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.04);
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
`;

const List = styled.ul`
  display: grid;
  gap: 0.15rem;
  max-height: 34rem;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;

  button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.4rem 0.5rem;
    border: 0;
    border-radius: 0.45rem;
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.85rem;
    text-align: left;
    cursor: pointer;
  }

  button[data-active="true"] {
    background: ${({ theme }) => theme.colors.goldSoft};
  }

  .rank {
    width: 2.4rem;
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

const Facts = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;

  div {
    display: grid;
    gap: 0.15rem;
    padding: 0.55rem 0.7rem;
    border-radius: 0.6rem;
    background: rgba(255, 255, 255, 0.04);
  }

  span {
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textDim};
  }
`;

const Routes = styled.ol`
  display: grid;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: grid;
    grid-template-columns: 2.5rem minmax(0, 1fr) auto;
    gap: 0.5rem;
    align-items: center;
    padding: 0.4rem 0.6rem;
    border-radius: 0.45rem;
    font-size: 0.85rem;
    background: rgba(255, 255, 255, 0.03);
  }

  li[data-tone="in"] .what {
    color: ${({ theme }) => theme.colors.text};
  }

  li[data-tone="wild"] .what {
    color: ${({ theme }) => theme.colors.warning};
  }

  li[data-tone="out"] .what {
    color: ${({ theme }) => theme.colors.textDim};
  }

  .pos {
    font-weight: 700;
  }

  .slot {
    color: ${({ theme }) => theme.colors.textMuted};
    font-variant-numeric: tabular-nums;
  }
`;
