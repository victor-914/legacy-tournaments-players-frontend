"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import styled from "styled-components";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TournamentStatus } from "@/types/domain";
import type { PublicCycleSummary } from "@/features/public-leaderboard/types";

interface TournamentTeaserCardProps {
  cycle: PublicCycleSummary;
  seasonName?: string;
  // Player and group counts come from the active cycle's leaderboard, so they
  // are only known for the cycle the public endpoints are currently serving.
  playerCount?: number;
  groupCount?: number;
}

export function TournamentTeaserCard({ cycle, seasonName, playerCount, groupCount }: TournamentTeaserCardProps) {
  const isLive = cycle.status === "active";

  return (
    <Shell as={motion.article} whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
      <CardBody>
        <Top>
          <Badge status={isLive ? TournamentStatus.Live : TournamentStatus.Completed} />
          {isLive ? (
            <LiveTag>
              <LiveDot />
              LIVE
            </LiveTag>
          ) : null}
        </Top>
        <h3>{cycle.name}</h3>
        <p>{seasonName ? `${seasonName} · Cycle ${cycle.cycleNumber}` : `Cycle ${cycle.cycleNumber}`}</p>
        <Stats>
          {typeof playerCount === "number" ? (
            <span>
              {playerCount} player{playerCount === 1 ? "" : "s"}
            </span>
          ) : null}
          {typeof groupCount === "number" ? (
            <span>
              {groupCount} group{groupCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </Stats>
        <Actions>
          <Link href="/leaderboard">
            <Button variant="secondary" fullWidth>
              View Standings
            </Button>
          </Link>
          {isLive ? (
            <Link href="/register">
              <Button variant="ghost" fullWidth>
                Join This Tournament
              </Button>
            </Link>
          ) : null}
        </Actions>
      </CardBody>
    </Shell>
  );
}

const Shell = styled(Card)`
  min-height: 18rem;

  h3 {
    margin: 1rem 0 0.3rem;
    font-size: 1.3rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LiveTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.success};
`;

const LiveDot = styled.i`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.success};
  box-shadow: ${({ theme }) => theme.shadows.glowGreen};
`;

const Stats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;

  span {
    border-radius: 999px;
    padding: 0.35rem 0.55rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.75rem;
  }
`;

const Actions = styled.div`
  display: grid;
  gap: 0.6rem;
  margin-top: 1.1rem;
`;
