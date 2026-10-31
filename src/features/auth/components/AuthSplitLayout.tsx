"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import styled from "styled-components";
import { ShaderBackdrop } from "@/components/ui/ShaderBackdrop";

interface AuthSplitLayoutProps {
  eyebrow: string;
  title: ReactNode;
  points: string[];
  // Wider form column for multi-field flows like registration.
  wide?: boolean;
  children: ReactNode;
}

// Two-column auth screen: a branded panel on the left (desktop only) and the
// form on the right. On phones the panel collapses away entirely so the form is
// the first thing on screen — the shader is never visible there, and the
// IntersectionObserver inside ShaderBackdrop keeps it from animating.
export function AuthSplitLayout({ eyebrow, title, points, wide = false, children }: AuthSplitLayoutProps) {
  return (
    <Shell $wide={wide}>
      <Brand>
        <ShaderBackdrop intensity={0.5} renderScale={0.5} />
        <BrandScrim aria-hidden="true" />
        <BrandCopy
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>{eyebrow}</span>
          <h2>{title}</h2>
          <ul>
            {points.map((point) => (
              <li key={point}>
                <CheckCircle2 size={18} aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </BrandCopy>
      </Brand>

      <FormColumn
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </FormColumn>
    </Shell>
  );
}

const Shell = styled.section<{ $wide: boolean }>`
  width: min(100%, ${({ $wide }) => ($wide ? "1280px" : "1120px")});
  margin: 0 auto;
  padding: 1rem 1rem calc(2.5rem + env(safe-area-inset-bottom));
  display: grid;
  gap: 1.5rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    min-height: calc(100dvh - 4.5rem);
    padding: 2rem 1.5rem 3rem;
    grid-template-columns: ${({ $wide }) => ($wide ? "minmax(0, 0.8fr) minmax(0, 1.2fr)" : "minmax(0, 1fr) minmax(0, 1fr)")};
    align-items: start;
    gap: 2rem;
  }
`;

const Brand = styled.aside`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: sticky;
    top: 6rem;
    isolation: isolate;
    overflow: hidden;
    display: grid;
    align-items: end;
    min-height: min(36rem, calc(100dvh - 9rem));
    border-radius: 20px;
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    background: ${({ theme }) => theme.colors.background};
    box-shadow: ${({ theme }) => theme.shadows.panel};
  }
`;

const BrandScrim = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(11, 11, 11, 0.1) 0%, rgba(11, 11, 11, 0.55) 45%, rgba(11, 11, 11, 0.94) 100%);
`;

const BrandCopy = styled(motion.div)`
  position: relative;
  display: grid;
  gap: 1rem;
  padding: 2.25rem;

  > span {
    color: ${({ theme }) => theme.colors.gold};
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    font-family: ${({ theme }) => theme.typography.displayFontFamily};
    font-weight: 400;
    font-size: clamp(2.4rem, 4vw, 3.4rem);
    line-height: 0.95;
    text-transform: uppercase;
  }

  ul {
    display: grid;
    gap: 0.7rem;
    margin: 0.5rem 0 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.45;
  }

  li svg {
    flex: 0 0 auto;
    margin-top: 0.1rem;
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const FormColumn = styled(motion.div)`
  min-width: 0;
`;
