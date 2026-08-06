"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import styled from "styled-components";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { TournamentStatus } from "@/types/domain";
import type { Tournament } from "@/types/domain";

export function TournamentTeaserCard({ tournament }: { tournament: Tournament }) {
  const isLive = tournament.status === TournamentStatus.Live;

  return (
    <Shell as={motion.article} whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
      <CardBody>
        <Top>
          <Badge status={tournament.status} />
          {isLive ? (
            <LiveTag>
              <LiveDot />
              LIVE
            </LiveTag>
          ) : null}
        </Top>
        <h3>{tournament.name}</h3>
        <p>{tournament.type}</p>
        <Stats>
          <span>{tournament.participants} players</span>
          <span>{tournament.qualificationSlots} slots</span>
          <span>{tournament.groupStage}</span>
        </Stats>
        <ProgressBar value={tournament.progress} label={tournament.currentCycle} />
        <Link href="/register">
          <Button variant="secondary" fullWidth>
            Join This Tournament
          </Button>
        </Link>
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

  a {
    display: block;
    margin-top: 1.1rem;
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
