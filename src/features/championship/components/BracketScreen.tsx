"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import { useChampionshipBracket, useChampionshipState } from "@/features/championship/hooks/useChampionship";
import { ChampionshipChrome, Muted, Panel, PanelTitle } from "@/features/championship/components/ChampionshipChrome";
import type { BracketSlot } from "@/features/championship/types";

const ROUNDS = [
  { key: "R64", name: "Round of 64", matches: 32 },
  { key: "R32", name: "Round of 32", matches: 16 },
  { key: "R16", name: "Round of 16", matches: 8 },
  { key: "QF", name: "Quarter-finals", matches: 4 },
  { key: "SF", name: "Semi-finals", matches: 2 },
  { key: "F", name: "Final", matches: 1 }
];

// Match m of a round feeds match ceil(m / 2) of the next round.
const routeFrom = (match: number): Set<string> => {
  const route = new Set<string>();
  let current = match;
  ROUNDS.forEach((round) => {
    route.add(`${round.key}-${current}`);
    current = Math.ceil(current / 2);
  });
  return route;
};

export function BracketScreen() {
  const { data: state } = useChampionshipState();
  const { data: bracket, isLoading } = useChampionshipBracket(state?.cycleId);
  const [selected, setSelected] = useState<BracketSlot | null>(null);

  const r64 = useMemo(() => {
    const map = new Map<number, BracketSlot[]>();
    for (const slot of bracket?.slots ?? []) {
      map.set(slot.match, [...(map.get(slot.match) ?? []), slot].sort((a, b) => a.side - b.side));
    }
    return map;
  }, [bracket]);
  const route = selected ? routeFrom(selected.match) : new Set<string>();

  return (
    <ChampionshipChrome
      eyebrow="Knockout route"
      title="Road to the"
      accent="final"
      intro="Every Round of 64 slot belongs to a group finishing position. Tap a slot to trace its path to the final. Groups pair A↔D, B↔C and E↔F, and players from the same group cannot meet before the Round of 16."
    >
      {isLoading ? <Muted>Loading the bracket…</Muted> : null}
      {!state ? <Muted>The championship has not been scheduled yet.</Muted> : null}
      {selected ? (
        <Panel>
          <PanelTitle>Route</PanelTitle>
          <Muted>
            <b>{selected.entrant?.gameTag ?? selected.originLabel}</b> · {ROUNDS.map((round) => `${round.name} M${[...route].find((key) => key.startsWith(`${round.key}-`))?.split("-")[1]}`).join(" → ")}
          </Muted>
        </Panel>
      ) : null}
      {bracket ? (
        <Panel>
          <PanelTitle>
            {bracket.final ? "Confirmed knockout entrants" : "Conditional slots · names appear as group positions settle"}
          </PanelTitle>
          <Scroller>
            <Columns>
              {ROUNDS.map((round) => (
                <Column key={round.key}>
                  <h3>{round.name}</h3>
                  {Array.from({ length: round.matches }).map((_, index) => {
                    const match = index + 1;
                    const onRoute = route.has(`${round.key}-${match}`);
                    if (round.key === "R64") {
                      const slots = r64.get(match) ?? [];
                      return (
                        <Match key={match} data-route={onRoute}>
                          {slots.map((slot) => (
                            <SlotButton
                              key={slot.side}
                              type="button"
                              data-wildcard={slot.isWildcard}
                              data-selected={selected?.match === slot.match && selected.side === slot.side}
                              onClick={() => setSelected(selected?.match === slot.match && selected.side === slot.side ? null : slot)}
                            >
                              <span>{slot.isWildcard ? `Wildcard ${slot.wildcardIndex}` : slot.originLabel.replace("Group ", "")}</span>
                              {slot.entrant ? (
                                <b>
                                  {slot.entrant.gameTag}
                                  {slot.entrant.provisional ? "*" : ""}
                                </b>
                              ) : null}
                            </SlotButton>
                          ))}
                        </Match>
                      );
                    }
                    return (
                      <Match key={match} data-route={onRoute}>
                        <Placeholder>
                          W · {ROUNDS[ROUNDS.indexOf(round) - 1].key} M{match * 2 - 1}
                        </Placeholder>
                        <Placeholder>
                          W · {ROUNDS[ROUNDS.indexOf(round) - 1].key} M{match * 2}
                        </Placeholder>
                      </Match>
                    );
                  })}
                </Column>
              ))}
            </Columns>
          </Scroller>
          {bracket.final ? null : <Muted>* provisional, based on current standings</Muted>}
        </Panel>
      ) : null}
    </ChampionshipChrome>
  );
}

const Scroller = styled.div`
  overflow-x: auto;
  padding-bottom: 0.5rem;
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(10.5rem, 1fr));
  gap: 0.75rem;
  min-width: 66rem;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 0.4rem;

  h3 {
    margin: 0 0 0.25rem;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const Match = styled.div`
  display: grid;
  gap: 2px;
  padding: 3px;
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};

  &[data-route="true"] {
    border-color: ${({ theme }) => theme.colors.gold};
    background: rgba(212, 175, 55, 0.08);
  }
`;

const SlotButton = styled.button`
  display: grid;
  gap: 1px;
  text-align: left;
  padding: 0.25rem 0.4rem;
  border: 0;
  border-radius: 0.35rem;
  background: rgba(255, 255, 255, 0.04);
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.72rem;
  cursor: pointer;

  span {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &[data-wildcard="true"] span {
    color: #ffb020;
  }

  &[data-selected="true"] {
    outline: 1px solid ${({ theme }) => theme.colors.gold};
  }
`;

const Placeholder = styled.div`
  padding: 0.3rem 0.4rem;
  border-radius: 0.35rem;
  background: rgba(255, 255, 255, 0.02);
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textDim};
`;
