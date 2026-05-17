"use client";

import styled from "styled-components";

export const PageStack = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    gap: 1.25rem;
  }
`;

export const Grid = styled.div<{ $columns?: number }>`
  display: grid;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(${({ $columns = 2 }) => $columns}, minmax(0, 1fr));
  }
`;

export const SplitGrid = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(0, 1.45fr) minmax(20rem, 0.55fr);
  }
`;

export const SectionTitle = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  h2 {
    margin: 0;
    font-size: 1rem;
  }

  p {
    margin: 0.2rem 0 0;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.86rem;
  }
`;

export const TableScroller = styled.div`
  overflow-x: auto;
`;
