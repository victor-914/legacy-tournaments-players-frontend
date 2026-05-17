"use client";

import styled from "styled-components";

interface TabItem<T extends string> {
  label: string;
  value: T;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (value: T) => void;
}

export function Tabs<T extends string>({ tabs, active, onChange }: TabsProps<T>) {
  return (
    <TabList>
      {tabs.map((tab) => (
        <button key={tab.value} type="button" data-active={tab.value === active} onClick={() => onChange(tab.value)}>
          {tab.label}
        </button>
      ))}
    </TabList>
  );
}

const TabList = styled.div`
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding: 0.3rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${({ theme }) => theme.colors.border};

  button {
    border: 0;
    border-radius: 7px;
    padding: 0.7rem 0.9rem;
    background: transparent;
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: pointer;
    font-weight: 800;
    white-space: nowrap;
  }

  button[data-active="true"] {
    color: #0b0b0b;
    background: ${({ theme }) => theme.colors.gold};
  }
`;
