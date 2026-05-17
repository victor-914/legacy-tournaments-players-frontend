"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import type { Player } from "@/types/domain";
import { AvatarImage } from "@/components/ui/AvatarImage";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { formatNumber } from "@/utils/format";

interface PlayerCardProps {
  player: Player;
  highlight?: boolean;
  rankLabel?: string;
}

export function PlayerCard({ player, highlight = false, rankLabel }: PlayerCardProps) {
  return (
    <Shell as={motion.article} whileHover={{ y: -4 }} $highlight={highlight}>
      <CardBody>
        <Top>
          <AvatarWrap>
            <AvatarImage src={player.avatarUrl} alt={`${player.gamerTag} avatar`} size={58} />
          </AvatarWrap>
          <div>
            {rankLabel ? <Rank>{rankLabel}</Rank> : null}
            <Name>{player.gamerTag}</Name>
            <Muted>{player.rank}</Muted>
          </div>
        </Top>
        <Stats>
          <span>
            <strong>{formatNumber(player.xp)}</strong>
            XP
          </span>
          <span>
            <strong>{player.level}</strong>
            LVL
          </span>
          <span>
            <strong>{player.winRate}%</strong>
            WIN
          </span>
        </Stats>
        <Badge status={player.qualificationStatus} />
      </CardBody>
    </Shell>
  );
}

const Shell = styled(Card)<{ $highlight: boolean }>`
  border-color: ${({ $highlight, theme }) => ($highlight ? theme.colors.borderStrong : theme.colors.border)};
  box-shadow: ${({ $highlight, theme }) => ($highlight ? theme.shadows.glowGold : theme.shadows.panel)};
`;

const Top = styled.div`
  display: flex;
  gap: 0.85rem;
  align-items: center;
  margin-bottom: 1rem;
`;

const AvatarWrap = styled.div`
  width: 3.7rem;
  height: 3.7rem;
  border-radius: 8px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surfaceGlass};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
`;

const Rank = styled.div`
  color: ${({ theme }) => theme.colors.gold};
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
`;

const Name = styled.h3`
  margin: 0.15rem 0;
  font-size: 1.05rem;
`;

const Muted = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;

  span {
    display: grid;
    gap: 0.15rem;
    color: ${({ theme }) => theme.colors.textDim};
    font-size: 0.72rem;
  }

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-size: 1rem;
  }
`;
