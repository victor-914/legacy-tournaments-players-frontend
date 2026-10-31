"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import styled from "styled-components";
import { ClassChip } from "@/features/championship/components/ChampionshipChrome";
import { CLASS_TIERS, REVEAL_STAGES, type DrawCurrent, type DrawStatus } from "@/features/championship/types";

const STAGE_TITLES: Record<string, string> = {
  class: "Class reveal",
  rank: "Season rank",
  stats: "Season record",
  name: "Player",
  group: "Group reveal"
};

// The live "who's next" card. Each stage the admin advances adds one layer:
// class → rank → stats → name → group. Fields for later stages are not sent
// by the server until that stage, so there is nothing to peek at.
export function DrawReveal({ current, status, total, drawn }: { current: DrawCurrent | null; status: DrawStatus; total: number; drawn: number }) {
  const reduceMotion = useReducedMotion();
  const stageIndex = current ? REVEAL_STAGES.indexOf(current.stage) : -1;
  const enter = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(8px)" };
  const shown = { opacity: 1, y: 0, filter: "blur(0px)" };

  if (!current) {
    return (
      <Stage>
        <Standby>
          <span>{status === "roster_locked" ? "The draw is about to begin" : status === "draft" ? "The draw has not been scheduled yet" : "Waiting for the next name"}</span>
          <strong>DRAW STANDBY</strong>
          <small>
            {drawn}/{total || 90} drawn
          </small>
        </Standby>
      </Stage>
    );
  }

  const isTopSeed = current.drawClass === "S";
  return (
    <Stage $glow={isTopSeed}>
      <StageLabel>
        Pick #{current.order} · {STAGE_TITLES[current.stage]}
        {current.paused ? " · paused" : ""}
      </StageLabel>
      <AnimatePresence mode="wait">
        <Card key={current.order} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <motion.div initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: isTopSeed ? 1.8 : 1.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 120, damping: 16 }}>
            <ClassChip value={current.drawClass} size="lg" />
          </motion.div>
          <Tier>{CLASS_TIERS[current.drawClass] ?? `Class ${current.drawClass}`}</Tier>

          {stageIndex >= 1 && current.seasonRank ? (
            <motion.div initial={enter} animate={shown} transition={{ duration: 0.45 }}>
              <Line>
                Battle Season rank <b>#{current.seasonRank}</b> · Pot {current.pot}
              </Line>
            </motion.div>
          ) : null}

          {stageIndex >= 2 ? (
            <motion.div initial={enter} animate={shown} transition={{ duration: 0.45 }}>
              <Stats>
                <div>
                  <span>Points</span>
                  <b>{current.points ?? "–"}</b>
                </div>
                <div>
                  <span>Wins</span>
                  <b>{current.wins ?? "–"}</b>
                </div>
                <div>
                  <span>Score diff</span>
                  <b>{current.scoreDifference ?? "–"}</b>
                </div>
                <div>
                  <span>Matches</span>
                  <b>{current.matchesPlayed ?? "–"}</b>
                </div>
              </Stats>
              {current.achievements?.length ? (
                <Achievements>
                  {current.achievements.map((achievement) => (
                    <li key={achievement}>{achievement}</li>
                  ))}
                </Achievements>
              ) : null}
            </motion.div>
          ) : null}

          {stageIndex >= 3 ? (
            <Name initial={reduceMotion ? { opacity: 0 } : { opacity: 0, letterSpacing: "0.6em" }} animate={{ opacity: 1, letterSpacing: "0.04em" }} transition={{ duration: isTopSeed ? 1 : 0.6 }}>
              {current.gameTag}
            </Name>
          ) : null}

          {stageIndex >= 4 ? (
            <GroupBadge initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 14 }}>
              Group {current.group}
            </GroupBadge>
          ) : null}
        </Card>
      </AnimatePresence>
    </Stage>
  );
}

const Stage = styled.div<{ $glow?: boolean }>`
  position: relative;
  min-height: 24rem;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 1.25rem;
  padding: 1.5rem 1rem;
  background: radial-gradient(60% 50% at 50% 40%, rgba(212, 175, 55, ${({ $glow }) => ($glow ? 0.22 : 0.12)}), transparent 72%),
    linear-gradient(180deg, #15140f, #0b0b09);
  box-shadow: ${({ $glow }) => ($glow ? "0 0 90px -20px rgba(251, 191, 36, 0.55)" : "none")};
`;

const StageLabel = styled.p`
  position: absolute;
  top: 0.9rem;
  left: 1rem;
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textDim};
`;

const Standby = styled.div`
  display: grid;
  gap: 0.4rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};

  strong {
    font-family: ${({ theme }) => theme.typography.displayFontFamily};
    font-size: clamp(2rem, 6vw, 3.2rem);
    letter-spacing: 0.08em;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Card = styled(motion.div)`
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  text-align: center;
  width: 100%;
`;

const Tier = styled.p`
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.gold};
`;

const Line = styled.p`
  margin: 0;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.textMuted};

  b {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
  width: min(100%, 28rem);

  div {
    display: grid;
    gap: 0.15rem;
    padding: 0.5rem;
    border-radius: 0.6rem;
    background: rgba(255, 255, 255, 0.04);
  }

  span {
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textDim};
  }

  b {
    font-size: 1.15rem;
    font-variant-numeric: tabular-nums;
  }
`;

const Achievements = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
  margin: 0.6rem 0 0;
  padding: 0;
  list-style: none;

  li {
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    font-size: 0.75rem;
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const Name = styled(motion.p)`
  margin: 0.25rem 0 0;
  font-family: ${({ theme }) => theme.typography.displayFontFamily};
  font-size: clamp(2.2rem, 8vw, 4.6rem);
  line-height: 1;
  text-transform: uppercase;
  word-break: break-word;
`;

const GroupBadge = styled(motion.p)`
  margin: 0;
  padding: 0.5rem 1.4rem;
  border-radius: 999px;
  font-family: ${({ theme }) => theme.typography.displayFontFamily};
  font-size: clamp(1.4rem, 4vw, 2rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0b0b0b;
  background: linear-gradient(135deg, #fff1b8, #d4af37 60%, #8a6a12);
`;
