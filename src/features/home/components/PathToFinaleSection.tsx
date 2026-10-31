"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, Crown, Swords, UserPlus } from "lucide-react";
import styled from "styled-components";

const STEPS = [
  {
    icon: UserPlus,
    title: "Register",
    description: "Create your player account with your game tag and a stat screenshot."
  },
  {
    icon: ClipboardCheck,
    title: "Get approved",
    description: "Our team verifies your stats, then places you in the next cycle's pool."
  },
  {
    icon: Swords,
    title: "Win your group",
    description: "Play scheduled group-stage matches. Verified results earn you group points."
  },
  {
    icon: Crown,
    title: "Reach the finale",
    description: "Top finishers in each cycle qualify for the season's grand finale."
  }
];

export function PathToFinaleSection() {
  return (
    <Wrap aria-labelledby="path-heading">
      <Inner>
        <Header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <Eyebrow>How it works</Eyebrow>
          <h2 id="path-heading">Your path to the grand finale</h2>
        </Header>

        <Steps>
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <Step
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: index * 0.09 }}
            >
              <Marker>
                <Icon size={20} aria-hidden="true" />
                <Number>{String(index + 1).padStart(2, "0")}</Number>
              </Marker>
              <h3>{title}</h3>
              <p>{description}</p>
            </Step>
          ))}
        </Steps>
      </Inner>
    </Wrap>
  );
}

const Wrap = styled.section`
  padding: 3rem 1.25rem 2rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 4.5rem 1.5rem 3rem;
  }
`;

const Inner = styled.div`
  width: min(100%, 1280px);
  margin: 0 auto;
  display: grid;
  gap: 2rem;
`;

const Header = styled(motion.div)`
  display: grid;
  gap: 0.5rem;

  h2 {
    margin: 0;
    font-family: ${({ theme }) => theme.typography.displayFontFamily};
    font-weight: 400;
    font-size: clamp(1.9rem, 5vw, 3rem);
    line-height: 1;
    text-transform: uppercase;
  }
`;

const Eyebrow = styled.span`
  color: ${({ theme }) => theme.colors.gold};
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

const Steps = styled.ol`
  position: relative;
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1.25rem;

    /* Connecting rail between the step markers on wide screens. */
    &::before {
      content: "";
      position: absolute;
      top: 2.6rem;
      left: 3rem;
      right: 3rem;
      height: 1px;
      background: linear-gradient(90deg, transparent, ${({ theme }) => theme.colors.borderStrong} 12%, ${({ theme }) => theme.colors.borderStrong} 88%, transparent);
    }
  }
`;

const Step = styled(motion.li)`
  position: relative;
  display: grid;
  gap: 0.55rem;
  align-content: start;
  padding: 1.35rem;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.neumorphicRaised};

  h3 {
    margin: 0.4rem 0 0;
    font-size: 1.05rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.9rem;
    line-height: 1.55;
  }
`;

const Marker = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;

  svg {
    box-sizing: content-box;
    padding: 0.6rem;
    border-radius: 12px;
    color: ${({ theme }) => theme.colors.gold};
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    box-shadow: ${({ theme }) => theme.shadows.glowGold};
  }
`;

const Number = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFontFamily};
  font-size: 1.6rem;
  line-height: 1;
  color: rgba(212, 175, 55, 0.35);
`;
