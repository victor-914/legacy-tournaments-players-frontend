"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import styled from "styled-components";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Tournament } from "@/types/domain";

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  return (
    <Shell as={motion.article} whileHover={{ y: -5 }}>
      <CardBody>
        <Top>
          <Badge status={tournament.status} />
          <LiveDot />
        </Top>
        <h3>{tournament.name}</h3>
        <p>{tournament.type} / {tournament.currentCycle}</p>
        <Stats>
          <span>{tournament.participants} players</span>
          <span>{tournament.qualificationSlots} slots</span>
          <span>{tournament.groupStage}</span>
        </Stats>
        <ProgressBar value={tournament.progress} label="Tournament progress" />
        <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
      </CardBody>
    </Shell>
  );
}

const Shell = styled(Card)`
  min-height: 17rem;

  h3 {
    margin: 1rem 0 0.35rem;
    font-size: 1.35rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  a {
    display: inline-flex;
    margin-top: 1rem;
    color: ${({ theme }) => theme.colors.gold};
    font-weight: 900;
  }
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LiveDot = styled.i`
  width: 0.65rem;
  height: 0.65rem;
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
