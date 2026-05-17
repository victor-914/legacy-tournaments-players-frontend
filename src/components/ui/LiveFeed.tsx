"use client";

import { motion } from "framer-motion";
import styled from "styled-components";
import type { ActivityItem } from "@/types/domain";

export function LiveFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Feed>
      {items.map((item, index) => (
        <FeedItem key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
          <Dot $type={item.type} />
          <span>{item.message}</span>
          <time>{item.createdAt}</time>
        </FeedItem>
      ))}
    </Feed>
  );
}

const Feed = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const FeedItem = styled(motion.div)`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.86rem;

  time {
    color: ${({ theme }) => theme.colors.textDim};
    font-size: 0.74rem;
  }
`;

const Dot = styled.i<{ $type: ActivityItem["type"] }>`
  width: 0.62rem;
  height: 0.62rem;
  border-radius: 50%;
  background: ${({ $type, theme }) =>
    $type === "dispute"
      ? theme.colors.error
      : $type === "qualification"
        ? theme.colors.gold
        : $type === "match"
          ? theme.colors.success
          : theme.colors.info};
  box-shadow: 0 0 18px currentColor;
`;
