"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import styled from "styled-components";
import { LinkButton } from "@/components/ui/Button";

export function CtaBannerSection() {
  return (
    <Wrap aria-labelledby="cta-heading">
      <Inner
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <Copy>
          <Eyebrow>Next cycle is filling up</Eyebrow>
          <h2 id="cta-heading">Ready to build your legacy?</h2>
          <p>Create your account, submit your qualification stats, and get placed into the next group stage.</p>
        </Copy>
        <Actions>
          <LinkButton href="/register" variant="primary">
            Join Tournaments
            <ArrowRight size={18} aria-hidden="true" />
          </LinkButton>
          <LinkButton href="/login" variant="ghost">
            I already have an account
          </LinkButton>
        </Actions>
      </Inner>
    </Wrap>
  );
}

const Wrap = styled.section`
  padding: 1.5rem 1.25rem 3.5rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 2rem 1.5rem 5rem;
  }
`;

const Inner = styled(motion.div)`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  width: min(100%, 1280px);
  margin: 0 auto;
  display: grid;
  gap: 1.5rem;
  padding: 2rem 1.35rem;
  border-radius: 20px;
  background:
    radial-gradient(ellipse 80% 120% at 100% 0%, rgba(212, 175, 55, 0.22), transparent 60%),
    linear-gradient(135deg, ${({ theme }) => theme.colors.goldSoft}, ${({ theme }) => theme.colors.surface} 70%);
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  box-shadow: ${({ theme }) => theme.shadows.glowGold};

  /* Slow diagonal sheen. Transform-only, so it stays on the compositor. */
  &::after {
    content: "";
    position: absolute;
    inset: -50% auto -50% -30%;
    z-index: -1;
    width: 30%;
    background: linear-gradient(90deg, transparent, rgba(255, 240, 166, 0.08), transparent);
    transform: translateX(0) rotate(12deg);
    animation: sheen 7s ease-in-out infinite;
  }

  @keyframes sheen {
    0%,
    30% {
      transform: translateX(0) rotate(12deg);
    }
    70%,
    100% {
      transform: translateX(560%) rotate(12deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
      display: none;
    }
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 2rem;
    padding: 2.75rem 2.5rem;
  }
`;

const Copy = styled.div`
  display: grid;
  gap: 0.5rem;

  h2 {
    margin: 0;
    font-family: ${({ theme }) => theme.typography.displayFontFamily};
    font-weight: 400;
    font-size: clamp(1.9rem, 5vw, 2.9rem);
    line-height: 1;
    text-transform: uppercase;
  }

  p {
    margin: 0;
    max-width: 34rem;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 1rem;
    line-height: 1.55;
  }
`;

const Eyebrow = styled.span`
  color: ${({ theme }) => theme.colors.gold};
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

const Actions = styled.div`
  display: grid;
  gap: 0.75rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-auto-flow: column;
    justify-content: start;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-auto-flow: row;
    justify-content: stretch;
  }
`;
