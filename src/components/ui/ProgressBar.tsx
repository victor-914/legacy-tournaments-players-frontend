"use client";

import { motion } from "framer-motion";
import styled from "styled-components";
import { formatPercent } from "@/utils/format";

interface ProgressBarProps {
  value: number;
  label?: string;
  tone?: "gold" | "green" | "red";
}

export function ProgressBar({ value, label, tone = "gold" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <Wrap>
      {label ? (
        <Meta>
          <span>{label}</span>
          <strong>{formatPercent(clamped)}</strong>
        </Meta>
      ) : null}
      <Track>
        <Fill
          $tone={tone}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </Track>
    </Wrap>
  );
}

const Wrap = styled.div`
  display: grid;
  gap: 0.55rem;
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.82rem;

  strong {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Track = styled.div`
  width: 100%;
  height: 0.7rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.09);
`;

const Fill = styled(motion.div)<{ $tone: ProgressBarProps["tone"] }>`
  height: 100%;
  border-radius: inherit;
  background: ${({ $tone, theme }) =>
    $tone === "green"
      ? theme.colors.success
      : $tone === "red"
        ? theme.colors.error
        : `linear-gradient(90deg, ${theme.colors.gold}, #fff0a6)`};
  box-shadow: ${({ theme }) => theme.shadows.glowGold};
`;
