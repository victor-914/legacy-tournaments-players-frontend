"use client";

import { motion } from "framer-motion";
import styled from "styled-components";

export function PageLoader({ label }: { label: string }) {
  return (
    <Loader>
      <Pulse animate={{ scale: [1, 1.18, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.1 }} />
      <span>{label}</span>
    </Loader>
  );
}

const Loader = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Pulse = styled(motion.div)`
  width: 4rem;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.gold};
  box-shadow: ${({ theme }) => theme.shadows.glowGold};
`;
