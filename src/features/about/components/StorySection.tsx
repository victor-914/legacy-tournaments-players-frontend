"use client";

import { motion } from "framer-motion";
import styled from "styled-components";
import { storyStats } from "@/constants/aboutContent";

export function StorySection() {
  return (
    <Wrap>
      <Inner
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <Copy>
          <h2>Our Story</h2>
          <p>
            Legacy Esports started as a single-elimination bracket run out of a Discord server in 2021. What began
            as a weekend event for a few dozen local players has grown into a full weekly league with group-stage
            qualifiers, live-cast finales, and community meetups between seasons.
          </p>
          <p>
            Every event we run — from a regional LAN qualifier to a studio broadcast night — is built around the
            same idea: a clear, fair path from your first match to the grand finale stage.
          </p>
        </Copy>
        <Stats>
          {storyStats.map((stat) => (
            <Stat key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </Stat>
          ))}
        </Stats>
      </Inner>
    </Wrap>
  );
}

const Wrap = styled.section`
  padding: 3rem 1.25rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 4.5rem 1.5rem;
  }
`;

const Inner = styled(motion.div)`
  width: min(100%, 1280px);
  margin: 0 auto;
  display: grid;
  gap: 2.5rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1.2fr 1fr;
    align-items: center;
  }
`;

const Copy = styled.div`
  display: grid;
  gap: 1rem;
  max-width: 34rem;

  h2 {
    margin: 0;
    font-size: 1.9rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.65;
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const Stat = styled.div`
  display: grid;
  gap: 0.25rem;
  padding: 1.25rem;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.neumorphicRaised};
  text-align: center;

  strong {
    font-size: 1.6rem;
    font-weight: 900;
    color: ${({ theme }) => theme.colors.gold};
    font-variant-numeric: tabular-nums;
  }

  span {
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;
