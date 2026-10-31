"use client";

import styled from "styled-components";
import { useChampionshipState } from "@/features/championship/hooks/useChampionship";
import { ChampionshipChrome, Muted, Panel, PanelTitle } from "@/features/championship/components/ChampionshipChrome";
import { WILDCARD_CRITERIA_LABELS } from "@/features/championship/types";

export function RulesScreen() {
  const { data: state } = useChampionshipState();
  const preset = state?.preset ?? {
    groups: 6,
    playersPerGroup: 15,
    pots: 3,
    requiredMatchesPerPlayer: 14,
    autoQualifiersPerGroup: 10,
    wildcardPosition: 11,
    wildcardCount: 4,
    bracketSize: 64
  };
  const total = preset.groups * preset.playersPerGroup;

  return (
    <ChampionshipChrome eyebrow="Format, fairness and audit" title="How the" accent="championship works">
      <Grid>
        <Panel>
          <PanelTitle>Format</PanelTitle>
          <Steps>
            <li>
              <b>{total} qualifiers</b> from the season&apos;s cycles are ranked by total points (then wins, score difference, fewer
              matches played, earliest qualification).
            </li>
            <li>
              They form <b>{preset.pots} pots of {total / preset.pots}</b>: ranks 1–{total / preset.pots}, {total / preset.pots + 1}–
              {(2 * total) / preset.pots} and {(2 * total) / preset.pots + 1}–{total}.
            </li>
            <li>
              A live seeded draw places them into <b>{preset.groups} groups of {preset.playersPerGroup}</b>: the top {preset.groups} seeds go
              to different groups, then every group receives exactly {preset.playersPerGroup / preset.pots} players from each pot.
            </li>
            <li>
              Each player plays everyone in their group once: <b>{preset.requiredMatchesPerPlayer} matches</b>, with fixtures and deadlines
              set by the admins.
            </li>
            <li>
              The top <b>{preset.autoQualifiersPerGroup}</b> in each group qualify. The {preset.groups} players finishing{" "}
              {preset.wildcardPosition}th are compared and the best <b>{preset.wildcardCount}</b> also advance, making the{" "}
              <b>Round of {preset.bracketSize}</b>.
            </li>
          </Steps>
        </Panel>

        <Panel>
          <PanelTitle>Wildcard tiebreak order</PanelTitle>
          {state?.wildcardCriteria.length ? (
            <Steps>
              {state.wildcardCriteria.map((criterion) => (
                <li key={criterion}>{WILDCARD_CRITERIA_LABELS[criterion] ?? criterion}</li>
              ))}
            </Steps>
          ) : (
            <Muted>Published with the championship.</Muted>
          )}
          <Muted>Locked when the draw starts. Players still level on every criterion are decided by the admins and announced.</Muted>
        </Panel>

        <Panel>
          <PanelTitle>Draw integrity</PanelTitle>
          <Muted>
            The complete draw order is fixed from a random seed the moment the draw starts; picks are only revealed one at a time. The seed is
            published when the draw completes so anyone can re-run the algorithm and confirm the result. Undo only rewinds the reveal (the same
            player comes out again); a full restart discards the seed and is logged below with a reason.
          </Muted>
          <Seed>
            Seed: <code>{state?.seed ?? "revealed when the draw completes"}</code>
          </Seed>
        </Panel>

        <Panel>
          <PanelTitle>Public audit log</PanelTitle>
          {state?.auditLog.length ? (
            <Log>
              {[...state.auditLog].reverse().map((entry, index) => (
                <li key={`${entry.at}-${index}`}>
                  <time>{new Date(entry.at).toLocaleString()}</time>
                  <span>
                    {entry.action.replace(/_/g, " ")}
                    {entry.details ? ` — ${entry.details}` : ""}
                  </span>
                </li>
              ))}
            </Log>
          ) : (
            <Muted>No draw actions yet.</Muted>
          )}
        </Panel>
      </Grid>
    </ChampionshipChrome>
  );
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
  gap: 1rem;
`;

const Steps = styled.ol`
  display: grid;
  gap: 0.55rem;
  margin: 0 0 0.75rem;
  padding-left: 1.2rem;
  color: ${({ theme }) => theme.colors.textMuted};

  b {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Seed = styled.p`
  margin: 0.75rem 0 0;

  code {
    padding: 0.15rem 0.4rem;
    border-radius: 0.3rem;
    background: rgba(255, 255, 255, 0.06);
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const Log = styled.ol`
  display: grid;
  gap: 0.4rem;
  max-height: 24rem;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.85rem;

  li {
    display: grid;
    gap: 0.1rem;
  }

  time {
    font-size: 0.72rem;
    color: ${({ theme }) => theme.colors.textDim};
  }
`;
