"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import styled from "styled-components";

const KICKER = "Hello player,";
const LINES = ["we are,", "Legacy Gaming"];

export function IntroHero() {
  const sectionRef = useRef<HTMLElement>(null);

  function scrollPastIntro() {
    const next = sectionRef.current?.nextElementSibling;
    next?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <Wrap ref={sectionRef}>
      {/* Muted + playsInline are what let mobile browsers autoplay at all. The
          poster and the wrap's own background cover the frames before it
          decodes, and stand in entirely where webm is unsupported. */}
      <Video autoPlay muted loop playsInline preload="auto" poster="/legacy_logo.jpeg" aria-hidden="true">
        <source src="/video/we-are-legacy.webm" type="video/webm" />
      </Video>
      <Scrim aria-hidden="true" />

      <Copy>
        <Kicker
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
        >
          {KICKER}
        </Kicker>

        {LINES.map((line, index) => (
          <Line
            key={line}
            $emphasis={index === LINES.length - 1}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 + index * 0.45, ease: "easeOut" }}
          >
            {line}
          </Line>
        ))}
      </Copy>

      <ScrollCue
        type="button"
        onClick={scrollPastIntro}
        aria-label="Scroll to tournaments"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 2.1 }}
      >
        <ChevronDown size={26} />
      </ScrollCue>
    </Wrap>
  );
}

const Wrap = styled.section`
  position: relative;
  display: grid;
  align-items: center;
  justify-items: start;
  /* Fills the viewport under the sticky nav without overflowing it. dvh keeps
     mobile browser chrome from cropping the last line. */
  min-height: calc(100dvh - 4.5rem);
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
`;

const Video = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Scrim = styled.div`
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(11, 11, 11, 0.82) 0%, rgba(11, 11, 11, 0.45) 55%, rgba(11, 11, 11, 0.2) 100%),
    linear-gradient(180deg, rgba(11, 11, 11, 0.45) 0%, rgba(11, 11, 11, 0.25) 45%, rgba(11, 11, 11, 0.9) 100%);
`;

const Copy = styled.div`
  position: relative;
  display: grid;
  justify-items: start;
  gap: 0.2rem;
  /* Matches the nav/section container so the copy lines up with the rest of
     the page rather than hugging the viewport edge. */
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: 0 1.25rem;
  text-align: left;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 1.5rem;
  }
`;

const Kicker = styled(motion.p)`
  margin: 0 0 0.6rem;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: clamp(0.8rem, 2.2vw, 1rem);
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.85;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.6);
`;

const Line = styled(motion.p)<{ $emphasis: boolean }>`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.displayFontFamily};
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ $emphasis }) => ($emphasis ? "clamp(3rem, 12vw, 8rem)" : "clamp(1.6rem, 5.5vw, 3.4rem)")};
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.55);
`;

const ScrollCue = styled(motion.button)`
  position: absolute;
  bottom: 1.75rem;
  left: 50%;
  transform: translateX(-50%);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.9rem;
  height: 2.9rem;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceGlass};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  animation: nudge 2.2s ease-in-out infinite;

  @keyframes nudge {
    0%,
    100% {
      transform: translate(-50%, 0);
    }
    50% {
      transform: translate(-50%, 0.4rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
