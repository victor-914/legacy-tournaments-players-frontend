"use client";

import { motion } from "framer-motion";
import styled from "styled-components";
import { AvatarImage } from "@/components/ui/AvatarImage";
import { Badge } from "@/components/ui/Badge";
import type { Standing } from "@/types/domain";
import { formatNumber } from "@/utils/format";

interface LeaderboardTableProps {
  standings: Standing[];
  showQualificationLine?: boolean;
}

export function LeaderboardTable({ standings, showQualificationLine = true }: LeaderboardTableProps) {
  return (
    <TableWrap>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>W</th>
          <th>L</th>
          <th>XP</th>
          <th>Pts</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((standing, index) => (
          <motion.tr
            key={standing.player.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <td>#{standing.rank}</td>
            <td>
              <PlayerCell>
                {/* <AvatarImage src={standing.player.avatarUrl} alt={`${standing.player.gamerTag} avatar`} size={32} /> */}
                <span>{standing.player.gamerTag}</span>
              </PlayerCell>
            </td>
            <td>{standing.wins}</td>
            <td>{standing.losses}</td>
            <td>{formatNumber(standing.xp)}</td>
            <td>{standing.points}</td>
            <td>
              <Badge status={standing.qualificationStatus} />
            </td>
          </motion.tr>
        ))}
        {showQualificationLine ? (
          <tr>
            <LineCell colSpan={7}>TOP 5 QUALIFY</LineCell>
          </tr>
        ) : null}
      </tbody>
    </TableWrap>
  );
}

const TableWrap = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;

  th,
  td {
    padding: 0.9rem 0.8rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  th {
    color: ${({ theme }) => theme.colors.textDim};
    font-size: 0.74rem;
    text-transform: uppercase;
  }

  td {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const PlayerCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;

  img {
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  }
`;

const LineCell = styled.td`
  text-align: center !important;
  color: ${({ theme }) => theme.colors.gold} !important;
  background: ${({ theme }) => theme.colors.goldSoft};
  box-shadow: inset 0 0 24px rgba(212, 175, 55, 0.18);
  font-weight: 900;
`;
