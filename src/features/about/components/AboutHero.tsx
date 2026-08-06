"use client";

import { motion } from "framer-motion";
import styled from "styled-components";

export function AboutHero() {
  return (
    <Wrap>
      <Banner src="/images/hero/about-banner.svg" alt="" aria-hidden="true" />
      <Overlay />
      <Content
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Kicker>About Legacy Esports</Kicker>
        <Headline>A competitive home for players who want to be seen.</Headline>
        <Subcopy>
          We build weekly tournaments, transparent standings, and live events for a gaming community that outgrew
          casual matchmaking. This is the story, the people, and the vision behind it.
        </Subcopy>
      </Content>
    </Wrap>
  );
}

const Wrap = styled.section`
  position: relative;
  overflow: hidden;
  min-height: 20rem;
  display: flex;
  align-items: center;
`;

const Banner = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(11, 11, 11, 0.55), rgba(11, 11, 11, 0.92));
`;

const Content = styled(motion.div)`
  position: relative;
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: 3.5rem 1.25rem;
  max-width: 42rem;
  display: grid;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 5rem 1.5rem;
  }
`;

const Kicker = styled.p`
  margin: 0;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.gold};
`;

const Headline = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 4.5vw, 2.9rem);
  line-height: 1.1;
`;

const Subcopy = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 1rem;
  line-height: 1.6;
`;
