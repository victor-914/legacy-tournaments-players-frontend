"use client";

import styled, { css } from "styled-components";
import { QualificationStatus, TournamentStatus } from "@/types/domain";
import { formatStatus } from "@/utils/format";

type BadgeTone = "gold" | "green" | "red" | "blue" | "muted";

interface BadgeProps {
  label?: string;
  status?: QualificationStatus | TournamentStatus;
  tone?: BadgeTone;
}

export function Badge({ label, status, tone }: BadgeProps) {
  return <Pill $tone={tone ?? toneFromStatus(status)}>{label ?? (status ? formatStatus(status) : "")}</Pill>;
}

function toneFromStatus(status?: QualificationStatus | TournamentStatus): BadgeTone {
  if (!status) return "muted";
  if (
    status === QualificationStatus.Qualified ||
    status === QualificationStatus.GrandFinaleQualified ||
    status === TournamentStatus.Live
  ) {
    return "green";
  }
  if (status === QualificationStatus.Eliminated) return "red";
  if (status === QualificationStatus.NearQualification || status === TournamentStatus.GrandFinale) return "gold";
  return "blue";
}

const Pill = styled.span<{ $tone: BadgeTone }>`
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 0.35rem;
  border-radius: 999px;
  padding: 0.35rem 0.62rem;
  font-size: 0.73rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};

  ${({ $tone, theme }) =>
    $tone === "gold" &&
    css`
      color: ${theme.colors.gold};
      background: ${theme.colors.goldSoft};
      border-color: ${theme.colors.borderStrong};
      box-shadow: ${theme.shadows.glowGold};
    `}

  ${({ $tone, theme }) =>
    $tone === "green" &&
    css`
      color: ${theme.colors.success};
      background: rgba(0, 200, 83, 0.12);
      border-color: rgba(0, 200, 83, 0.42);
    `}

  ${({ $tone, theme }) =>
    $tone === "red" &&
    css`
      color: ${theme.colors.error};
      background: rgba(255, 59, 48, 0.12);
      border-color: rgba(255, 59, 48, 0.44);
    `}

  ${({ $tone, theme }) =>
    $tone === "blue" &&
    css`
      color: ${theme.colors.info};
      background: rgba(58, 134, 255, 0.12);
      border-color: rgba(58, 134, 255, 0.42);
    `}
`;
