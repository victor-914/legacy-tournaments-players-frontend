"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Radio, Trophy } from "lucide-react";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { LinkButton } from "@/components/ui/Button";
import { ShaderBackdrop } from "@/components/ui/ShaderBackdrop";
import { publicLeaderboardService } from "@/features/public-leaderboard/services/publicLeaderboardService";

// Not sourced from the API: there is no public endpoint for prize money, so
// this stays an editorial figure.
const PRIZE_POOL_TO_BE_PAID_OUT = 25000;

function useCountUp(target: number, durationMs = 1400) {
  const [value, setValue] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      setValue(target);
      return;
    }

    let frame: number;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, reduceMotion]);

  return value;
}

function Stat({
  label,
  value,
  prefix
}: {
  label: string;
  // Undefined while the public endpoints are still loading, or if they failed.
  value?: number;
  prefix?: string;
}) {
  const animated = useCountUp(value ?? 0);
  return (
    <StatItem>
      <strong>
        {typeof value === "number" ? (
          <>
            {prefix}
            {animated.toLocaleString()}
          </>
        ) : (
          <StatSkeleton aria-label="Loading" />
        )}
      </strong>
      <span>{label}</span>
    </StatItem>
  );
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const }
});

export function HeroSection() {
  const cyclesQuery = useQuery({
    queryKey: ["public-cycles"],
    queryFn: () => publicLeaderboardService.getPublicCycles()
  });
  const leaderboardQuery = useQuery({
    queryKey: ["public-leaderboard"],
    queryFn: () => publicLeaderboardService.getPublicLeaderboard()
  });

  const activeCycles = cyclesQuery.data?.filter((cycle) => cycle.status === "active");
  const liveTournaments = activeCycles?.length;
  const activePlayers = leaderboardQuery.data?.total;
  const liveCycle = activeCycles?.[0];
  const completedCycles = cyclesQuery.data?.filter((cycle) => cycle.status === "completed").length;
  // Between cycles "0 live tournaments" is the weakest possible proof point, so
  // show the track record instead until the next cycle opens.
  const showCompleted = liveTournaments === 0 && (completedCycles ?? 0) > 0;

  return (
    <Wrap aria-labelledby="hero-heading">
      <ShaderBackdrop intensity={0.55} />
      <Scrim aria-hidden="true" />

      <Content>
        <motion.div {...fadeUp(0)}>
          <StatusPill href={liveCycle ? "/#tournaments" : "/register"}>
            <PillTag $live={Boolean(liveCycle)}>
              {liveCycle ? (
                <>
                  <LiveDot aria-hidden="true" />
                  Live
                </>
              ) : (
                "Open"
              )}
            </PillTag>
            <span>
              {liveCycle
                ? `${liveCycle.name || `Cycle ${liveCycle.cycleNumber}`} is in play`
                : "Registration open for the next cycle"}
            </span>
            <ArrowRight size={14} aria-hidden="true" />
          </StatusPill>
        </motion.div>

        <Headline id="hero-heading" {...fadeUp(0.08)}>
          Compete. Climb.
          <br />
          <GoldSpan>Go Legacy.</GoldSpan>
        </Headline>

        <Subcopy {...fadeUp(0.16)}>
          Weekly cycles, transparent group stages and a straight path to the grand finale. Every result is verified,
          every standing is public.
        </Subcopy>

        <Actions {...fadeUp(0.24)}>
          <LinkButton href="/register" variant="primary">
            <Trophy size={18} aria-hidden="true" />
            Join Tournaments
          </LinkButton>
          <LinkButton href="/leaderboard" variant="secondary">
            <Radio size={18} aria-hidden="true" />
            Watch Live Standings
          </LinkButton>
        </Actions>

        <ProofStrip {...fadeUp(0.34)}>
          {showCompleted ? (
            <Stat label="Cycles completed" value={completedCycles} />
          ) : (
            <Stat label="Live tournaments" value={liveTournaments} />
          )}
          <Divider aria-hidden="true" />
          <Stat label="Ranked players" value={activePlayers} />
          <Divider aria-hidden="true" />
          <Stat label="Prize pool to be paid" value={PRIZE_POOL_TO_BE_PAID_OUT} prefix="$" />
        </ProofStrip>
      </Content>
    </Wrap>
  );
}

const Wrap = styled.section`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 5rem 1.25rem 3.5rem;
  border-block: 1px solid ${({ theme }) => theme.colors.border};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 8rem 1.5rem 5.5rem;
  }
`;

const Scrim = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* Darkens the centre column behind the copy so text contrast stays above
     4.5:1 no matter where the rings are in their cycle. */
  background:
    radial-gradient(ellipse 50% 46% at 50% 46%, rgba(11, 11, 11, 0.82), rgba(11, 11, 11, 0.35) 70%, transparent 100%),
    linear-gradient(180deg, ${({ theme }) => theme.colors.background} 0%, transparent 18%, transparent 82%, ${({ theme }) => theme.colors.background} 100%);
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  width: min(100%, 52rem);
  margin: 0 auto;
  display: grid;
  justify-items: center;
  gap: 1.5rem;
  text-align: center;
`;

const StatusPill = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  min-height: 2.75rem;
  max-width: 100%;
  padding: 0.35rem 0.9rem 0.35rem 0.4rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;
  font-weight: 600;
  transition: border-color ${({ theme }) => theme.animations.normal}, background ${({ theme }) => theme.animations.normal};

  > span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  > svg {
    flex: 0 0 auto;
    color: ${({ theme }) => theme.colors.gold};
    transition: transform ${({ theme }) => theme.animations.normal};
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
    background: rgba(255, 255, 255, 0.09);
  }

  &:hover > svg {
    transform: translateX(3px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.gold};
    outline-offset: 3px;
  }
`;

const PillTag = styled.span<{ $live: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex: 0 0 auto;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: ${({ theme, $live }) => ($live ? "rgba(0, 200, 83, 0.16)" : theme.colors.goldSoft)};
  color: ${({ theme, $live }) => ($live ? theme.colors.success : theme.colors.gold)};
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const LiveDot = styled.i`
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 0 rgba(0, 200, 83, 0.6);
  animation: livePulse 1.8s ease-out infinite;

  @keyframes livePulse {
    0% {
      box-shadow: 0 0 0 0 rgba(0, 200, 83, 0.55);
    }
    100% {
      box-shadow: 0 0 0 0.5rem rgba(0, 200, 83, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Headline = styled(motion.h1)`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.displayFontFamily};
  font-weight: 400;
  font-size: clamp(2.9rem, 10vw, 6.25rem);
  line-height: 0.95;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  text-wrap: balance;
`;

const GoldSpan = styled.span`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.gold} 10%, #fff0a6 50%, ${({ theme }) => theme.colors.gold} 90%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const Subcopy = styled(motion.p)`
  margin: 0;
  max-width: 36rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: clamp(1rem, 2.4vw, 1.125rem);
  line-height: 1.6;
  text-wrap: pretty;
`;

const Actions = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  margin-top: 0.25rem;

  > a {
    width: 100%;
    padding-inline: 1.4rem;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: row;
    justify-content: center;
    width: auto;

    > a {
      width: auto;
    }
  }
`;

const ProofStrip = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  width: 100%;
  margin-top: 1.75rem;
  padding: 1.1rem 1.25rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(22, 22, 22, 0.62);
  backdrop-filter: blur(14px);
  box-shadow: ${({ theme }) => theme.shadows.panel};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr auto 1fr auto 1fr;
    align-items: center;
    padding: 1.25rem 1.5rem;
  }
`;

const Divider = styled.span`
  display: none;
  width: 1px;
  height: 2.5rem;
  background: ${({ theme }) => theme.colors.border};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: block;
  }
`;

const StatItem = styled.div`
  display: grid;
  gap: 0.15rem;
  justify-items: center;

  strong {
    min-height: 2.1rem;
    font-family: ${({ theme }) => theme.typography.displayFontFamily};
    font-weight: 400;
    font-size: clamp(1.6rem, 4vw, 2rem);
    line-height: 1.1;
    color: ${({ theme }) => theme.colors.text};
    font-variant-numeric: tabular-nums;
  }

  span {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const StatSkeleton = styled.i`
  display: inline-block;
  width: 3.5rem;
  height: 1.6rem;
  margin-top: 0.25rem;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.06));
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;

  @keyframes shimmer {
    to {
      background-position: -200% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
