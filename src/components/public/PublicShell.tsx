"use client";

import type { ReactNode } from "react";
import styled from "styled-components";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicNav } from "@/components/public/PublicNav";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <Wrap>
      <Ambient aria-hidden="true">
        <Orb $variant="gold" />
        <Orb $variant="blue" />
      </Ambient>
      <PublicNav />
      <Main>{children}</Main>
      <PublicFooter />
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  overflow-x: clip;
`;

const Ambient = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
`;

const Orb = styled.div<{ $variant: "gold" | "blue" }>`
  position: absolute;
  width: 42rem;
  height: 42rem;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.16;
  background: ${({ $variant }) => ($variant === "gold" ? "#D4AF37" : "#3A86FF")};
  top: ${({ $variant }) => ($variant === "gold" ? "-12rem" : "24rem")};
  left: ${({ $variant }) => ($variant === "gold" ? "-10rem" : "auto")};
  right: ${({ $variant }) => ($variant === "blue" ? "-14rem" : "auto")};
  animation: ${({ $variant }) => ($variant === "gold" ? "driftA" : "driftB")} 22s ease-in-out infinite;

  @keyframes driftA {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(4rem, 3rem) scale(1.1);
    }
  }

  @keyframes driftB {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(-3rem, -2rem) scale(1.08);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Main = styled.main`
  position: relative;
  z-index: 1;
`;
