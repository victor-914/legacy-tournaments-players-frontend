"use client";

import { motion } from "framer-motion";
import { Crown, Medal } from "lucide-react";
import styled, { css } from "styled-components";
import type { Standing } from "@/types/domain";

// Gold mirrors theme.colors.gold; silver/bronze are podium-only accents.
const PLACE_COLORS: Record<number, string> = {
  1: "#D4AF37",
  2: "#C9CED6",
  3: "#C68A4E"
};

interface QualifierPodiumProps {
  standings: Standing[];
}

export function QualifierPodium({ standings }: QualifierPodiumProps) {
  const top = standings.slice(0, 3);
  if (top.length === 0) return null;

  return (
    <Podium aria-label="Top qualifiers">
      {top.map((standing, index) => {
        const place = index + 1;
        const color = PLACE_COLORS[place] ?? PLACE_COLORS[3];
        return (
          <Step
            key={standing.player.id}
            $place={place}
            $color={color}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: place === 1 ? 0 : 0.1 * place, ease: [0.22, 1, 0.36, 1] }}
          >
            <Head>
              <Avatar $color={color} aria-hidden="true">
                {initials(standing.player.gamerTag)}
              </Avatar>
              <Place $color={color}>
                {place === 1 ? <Crown size={16} aria-hidden="true" /> : <Medal size={16} aria-hidden="true" />}
                <span>#{standing.rank}</span>
              </Place>
            </Head>
            <Name title={standing.player.gamerTag}>{standing.player.gamerTag}</Name>
            <Points>
              <strong>{standing.points}</strong>
              <span>pts</span>
            </Points>
            <Meta>
              {standing.wins}W · {standing.losses}L
              {standing.qualifiedGroupName ? ` · ${standing.qualifiedGroupName}` : ""}
            </Meta>
          </Step>
        );
      })}
    </Podium>
  );
}

function initials(tag: string) {
  const clean = tag.replace(/[^a-z0-9]/gi, "");
  return (clean.slice(0, 2) || "?").toUpperCase();
}

const Podium = styled.ol`
  display: grid;
  gap: 0.85rem;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: end;
    gap: 1rem;
  }
`;

const Step = styled(motion.li)<{ $place: number; $color: string }>`
  position: relative;
  overflow: hidden;
  display: grid;
  gap: 0.35rem;
  padding: 1.1rem 1.15rem 1.2rem;
  border-radius: 14px;
  border: 1px solid ${({ $color }) => `${$color}55`};
  background:
    radial-gradient(ellipse 90% 70% at 50% 0%, ${({ $color }) => `${$color}26`}, transparent 70%),
    ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadows.panel};

  /* Accent bar along the top edge. */
  &::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 3px;
    background: linear-gradient(90deg, transparent, ${({ $color }) => $color}, transparent);
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    justify-items: center;
    text-align: center;
    padding: 1.5rem 1.25rem;

    /* Classic podium order: 2 · 1 · 3, with the winner raised. */
    order: ${({ $place }) => ($place === 1 ? 2 : $place === 2 ? 1 : 3)};
    ${({ $place, $color }) =>
      $place === 1 &&
      css`
        padding-block: 2.1rem 1.9rem;
        box-shadow:
          0 0 40px ${`${$color}33`},
          0 24px 80px rgba(0, 0, 0, 0.42);
      `}
  }
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    gap: 0.6rem;
  }
`;

const Avatar = styled.span<{ $color: string }>`
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 2px solid ${({ $color }) => $color};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ $color }) => $color};
  font-family: ${({ theme }) => theme.typography.displayFontFamily};
  font-size: 1.1rem;
  letter-spacing: 0.04em;
  box-shadow: 0 0 18px ${({ $color }) => `${$color}40`};
`;

const Place = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: ${({ $color }) => `${$color}1f`};
  color: ${({ $color }) => $color};
  font-size: 0.8rem;
  font-weight: 900;
`;

const Name = styled.div`
  max-width: 100%;
  margin-top: 0.35rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  font-size: 1.15rem;
`;

const Points = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.3rem;

  strong {
    font-family: ${({ theme }) => theme.typography.displayFontFamily};
    font-weight: 400;
    font-size: 2rem;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  span {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
  }
`;

const Meta = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
`;
