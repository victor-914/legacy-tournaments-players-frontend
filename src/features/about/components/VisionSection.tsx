"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";
import styled from "styled-components";

export function VisionSection() {
  return (
    <Wrap>
      <Inner
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <IconMark>
          <Target size={26} />
        </IconMark>
        <Kicker>Our Vision</Kicker>
        <Quote>
          &ldquo;A league where any player can walk in on a Monday qualifier and walk out on a grand finale stage —
          judged only by results, never by who they know.&rdquo;
        </Quote>
        <Copy>
          We measure Legacy Esports by how fair the climb feels, not just how big the prize pool gets. Every format
          decision — group sizes, qualification slots, dispute review — is made to protect that climb.
        </Copy>
      </Inner>
    </Wrap>
  );
}

const Wrap = styled.section`
  padding: 1.5rem 1.25rem 4rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 2rem 1.5rem 5.5rem;
  }
`;

const Inner = styled(motion.div)`
  position: relative;
  overflow: hidden;
  width: min(100%, 1280px);
  margin: 0 auto;
  max-width: 46rem;
  display: grid;
  gap: 1rem;
  padding: 2.75rem 2rem;
  border-radius: 20px;
  text-align: center;
  justify-items: center;
  background: linear-gradient(160deg, ${({ theme }) => theme.colors.surface}, ${({ theme }) => theme.colors.background});
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  box-shadow: ${({ theme }) => theme.shadows.neumorphicRaised};
`;

const Copy = styled.p`
  margin: 0;
  max-width: 32rem;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.6;
`;

const IconMark = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.gold};
  background: ${({ theme }) => theme.colors.goldSoft};
  box-shadow: ${({ theme }) => theme.shadows.glowGold};
`;

const Kicker = styled.p`
  margin: 0;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.gold};
`;

const Quote = styled.p`
  margin: 0;
  max-width: 34rem;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: clamp(1.15rem, 2.6vw, 1.5rem);
  font-weight: 700;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.text};
`;
