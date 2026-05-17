"use client";

import styled from "styled-components";

export const Card = styled.article`
  position: relative;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  box-shadow: ${({ theme }) => theme.shadows.panel};
  backdrop-filter: blur(18px);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.11), transparent 38%);
  }
`;

export const CardBody = styled.div`
  position: relative;
  padding: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 1.25rem;
  }
`;
