"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { publicLeaderboardService } from "@/features/public-leaderboard/services/publicLeaderboardService";

// Not sourced from the API: there is no public endpoint for prize money, so
// this stays an editorial figure.
const PRIZE_POOL_TO_BE_PAID_OUT = 25000;

function useCountUp(target: number, durationMs = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
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
  }, [target, durationMs]);

  return value;
}

function StatChip({
  label,
  value,
  prefix,
  suffix
}: {
  label: string;
  // Undefined while the public endpoints are still loading, or if they failed.
  value?: number;
  prefix?: string;
  suffix?: string;
}) {
  const animated = useCountUp(value ?? 0);
  return (
    <Chip>
      <strong>
        {typeof value === "number" ? (
          <>
            {prefix}
            {animated.toLocaleString()}
            {suffix}
          </>
        ) : (
          "—"
        )}
      </strong>
      <span>{label}</span>
    </Chip>
  );
}

export function HeroSection() {
  const cyclesQuery = useQuery({
    queryKey: ["public-cycles"],
    queryFn: () => publicLeaderboardService.getPublicCycles()
  });
  const leaderboardQuery = useQuery({
    queryKey: ["public-leaderboard"],
    queryFn: () => publicLeaderboardService.getPublicLeaderboard()
  });

  const liveTournaments = cyclesQuery.data?.filter((cycle) => cycle.status === "active").length;
  const activePlayers = leaderboardQuery.data?.total;

  return (
    <Wrap>
      <Content>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Kicker>Weekly Cycles &middot; Fair Qualification &middot; Real Payouts</Kicker>
        </motion.div>

        <Headline
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
        >
          Compete. Climb. <GoldSpan>Go Legacy.</GoldSpan>
        </Headline>

        <Subcopy
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16, ease: "easeOut" }}
        >
          Legacy Esports runs live weekly tournaments with transparent brackets, group-stage qualifiers, and a
          straight path to the grand finale. Jump into an active cycle or watch the standings update in real time.
        </Subcopy>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24, ease: "easeOut" }}
        >
          <Actions>
            <Link href="/register">
              <Button variant="primary">Join Tournaments</Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="secondary">View Live Leaderboard</Button>
            </Link>
          </Actions>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32, ease: "easeOut" }}
        >
          <Stats>
            <StatChip label="Live Tournaments" value={liveTournaments} />
            <StatChip label="Ranked Players" value={activePlayers} />
            <StatChip label="Prize Pool To Be Paid Out" value={PRIZE_POOL_TO_BE_PAID_OUT} prefix="$" />
          </Stats>
        </motion.div>
      </Content>
    </Wrap>
  );
}

const Wrap = styled.section`
  position: relative;
  padding: 2.75rem 1.25rem 2.5rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 6rem 1.5rem 4.5rem;
  }
`;

const Content = styled.div`
  width: min(100%, 1280px);
  margin: 0 auto;
  max-width: 46rem;
  display: grid;
  gap: 1.4rem;
`;

const Kicker = styled.p`
  margin: 0;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.gold};
`;

const Headline = styled(motion.h1)`
  margin: 0;
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 900;
  line-height: 1.05;
`;

const Subcopy = styled(motion.p)`
  margin: 0;
  max-width: 34rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 1.05rem;
  line-height: 1.6;
`;

const GoldSpan = styled.span`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.gold}, #fff0a6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;

  /* Side by side these two overflow a phone, and simply wrapping left the
     second CTA as a stray half-width button. Stack them full width instead. */
  > a {
    flex: 1 1 100%;
  }

  > a > button {
    width: 100%;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    > a {
      flex: 0 1 auto;
    }

    > a > button {
      width: auto;
    }
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
  gap: 0.85rem;
  max-width: 38rem;
  padding-top: 0.5rem;
`;

const Chip = styled.div`
  display: grid;
  gap: 0.2rem;
  padding: 1rem 1.1rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.neumorphicRaised};

  strong {
    font-size: 1.5rem;
    font-weight: 900;
    color: ${({ theme }) => theme.colors.text};
    font-variant-numeric: tabular-nums;
  }

  span {
    font-size: 0.76rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;
