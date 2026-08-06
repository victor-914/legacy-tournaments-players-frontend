"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { tournaments } from "@/constants/mockData";
import { TournamentStatus } from "@/types/domain";

const STATS = [
  { label: "Live Tournaments", value: tournaments.filter((t) => t.status !== TournamentStatus.Completed).length },
  { label: "Active Players", value: 3400 },
  { label: "Prize Pool Paid Out", value: 25000, prefix: "$" }
];

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

function StatChip({ label, value, prefix }: { label: string; value: number; prefix?: string }) {
  const animated = useCountUp(value);
  return (
    <Chip>
      <strong>
        {prefix}
        {animated.toLocaleString()}
        {value >= 1000 ? "+" : ""}
      </strong>
      <span>{label}</span>
    </Chip>
  );
}

export function HeroSection() {
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
            {STATS.map((stat) => (
              <StatChip key={stat.label} label={stat.label} value={stat.value} prefix={stat.prefix} />
            ))}
          </Stats>
        </motion.div>
      </Content>
    </Wrap>
  );
}

const Wrap = styled.section`
  position: relative;
  padding: 3.5rem 1.25rem 3rem;

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
