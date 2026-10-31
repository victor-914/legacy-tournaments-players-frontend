"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styled from "styled-components";
import { PublicShell } from "@/components/public/PublicShell";
import type { DrawPick } from "@/features/championship/types";

const LINKS = [
  { label: "Live draw & groups", href: "/championship" },
  { label: "Bracket", href: "/championship/bracket" },
  { label: "Player routes", href: "/championship/players" },
  { label: "Rules & audit", href: "/championship/rules" }
];

export function ChampionshipChrome({
  eyebrow,
  title,
  accent,
  intro,
  children
}: {
  eyebrow: string;
  title: string;
  accent: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <PublicShell>
      <Page>
        <Hero>
          <Eyebrow>{eyebrow}</Eyebrow>
          <Heading>
            {title} <span>{accent}</span>
          </Heading>
          {intro ? <Intro>{intro}</Intro> : null}
        </Hero>
        <SubNav aria-label="Championship sections">
          {LINKS.map((link) => (
            <SubLink key={link.href} href={link.href} $active={pathname === link.href}>
              {link.label}
            </SubLink>
          ))}
        </SubNav>
        {children}
      </Page>
    </PublicShell>
  );
}

export function ClassChip({ value, size = "sm" }: { value: string; size?: "sm" | "lg" }) {
  return (
    <Chip $class={value} $size={size} aria-label={`Class ${value}`}>
      {value}
    </Chip>
  );
}

export function GroupsBoard({
  groups,
  highlightGroup,
  playersPerGroup = 15
}: {
  groups: Record<string, DrawPick[]>;
  highlightGroup?: string;
  playersPerGroup?: number;
}) {
  return (
    <Board>
      {Object.entries(groups).map(([letter, picks]) => (
        <GroupCard key={letter} $active={highlightGroup === letter}>
          <header>
            <strong>Group {letter}</strong>
            <span>
              {picks.length}/{playersPerGroup}
            </span>
          </header>
          <ol>
            {picks.map((pick) => (
              <li key={pick.order}>
                <ClassChip value={pick.drawClass} />
                <span className="name">{pick.gameTag}</span>
                <span className="rank">#{pick.seasonRank}</span>
              </li>
            ))}
            {Array.from({ length: Math.max(0, playersPerGroup - picks.length) }).map((_, index) => (
              <li key={`empty-${index}`} className="empty" aria-hidden="true" />
            ))}
          </ol>
        </GroupCard>
      ))}
    </Board>
  );
}

export const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 1.1rem;
  padding: 1.1rem;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  backdrop-filter: blur(14px);
`;

export const PanelTitle = styled.h2`
  margin: 0 0 0.8rem;
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.gold};
`;

export const Muted = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Page = styled.div`
  position: relative;
  z-index: 1;
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  display: grid;
  gap: 1.25rem;
`;

const Hero = styled.div`
  display: grid;
  gap: 0.5rem;
`;

const Eyebrow = styled.p`
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.gold};
`;

const Heading = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.displayFontFamily};
  font-size: clamp(2.2rem, 7vw, 4.2rem);
  line-height: 1;
  letter-spacing: 0.02em;
  text-transform: uppercase;

  span {
    background: linear-gradient(180deg, #fff3c4, #d4af37 55%, #8a6a12);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
`;

const Intro = styled.div`
  max-width: 46rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const SubNav = styled.nav`
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
`;

const SubLink = styled(Link)<{ $active: boolean }>`
  flex: none;
  padding: 0.55rem 0.95rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.borderStrong : theme.colors.border)};
  color: ${({ theme, $active }) => ($active ? theme.colors.gold : theme.colors.textMuted)};
  background: ${({ theme, $active }) => ($active ? theme.colors.goldSoft : "transparent")};
`;

const CHIP_BG: Record<string, string> = {
  S: "linear-gradient(135deg, #fff1b8, #d4af37 60%, #8a6a12)",
  A: "linear-gradient(135deg, #ffffff, #cbd5e1)",
  B: "linear-gradient(135deg, #bde3ff, #3a86ff)",
  C: "linear-gradient(135deg, #e3d4ff, #8e6cff)"
};

const Chip = styled.span<{ $class: string; $size: "sm" | "lg" }>`
  display: inline-grid;
  place-items: center;
  flex: none;
  width: ${({ $size }) => ($size === "lg" ? "4.5rem" : "1.25rem")};
  height: ${({ $size }) => ($size === "lg" ? "4.5rem" : "1.25rem")};
  border-radius: ${({ $size }) => ($size === "lg" ? "1rem" : "0.3rem")};
  font-family: ${({ theme }) => theme.typography.displayFontFamily};
  font-size: ${({ $size }) => ($size === "lg" ? "2.6rem" : "0.7rem")};
  color: #0b0b0b;
  background: ${({ $class }) => CHIP_BG[$class] ?? "#555"};
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 13.5rem), 1fr));
  gap: 0.75rem;
`;

const GroupCard = styled.div<{ $active: boolean }>`
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.gold : theme.colors.border)};
  border-radius: 0.9rem;
  padding: 0.75rem;
  background: ${({ $active }) => ($active ? "rgba(212, 175, 55, 0.07)" : "rgba(255, 255, 255, 0.02)")};
  transition: border-color 0.3s ease, background 0.3s ease;

  header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;

    span {
      color: ${({ theme }) => theme.colors.textDim};
      font-variant-numeric: tabular-nums;
    }
  }

  ol {
    display: grid;
    gap: 0.2rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    min-height: 1.45rem;
    padding: 0 0.35rem;
    border-radius: 0.35rem;
    background: rgba(255, 255, 255, 0.03);
    font-size: 0.8rem;
  }

  li.empty {
    background: rgba(255, 255, 255, 0.015);
  }

  .name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rank {
    color: ${({ theme }) => theme.colors.textDim};
    font-variant-numeric: tabular-nums;
  }
`;
