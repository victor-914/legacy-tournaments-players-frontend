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

  /* Tablets need an intermediate step. Going straight from one column to three
     or four the moment we hit 768px left each card around 180px wide, which
     broke headings onto four lines. Cap at two until there is room. */
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(${({ $columns = 2 }) => Math.min($columns, 2)}, minmax(0, 1fr));
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
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
  /* The trailing "see all" link is nowrap, so keeping this a row on phones
     squeezed the heading and its blurb into a narrow column beside it. Stack
     until there is width for both. */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: row;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
  }

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
