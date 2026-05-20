"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Radar } from "lucide-react";
import styled, { keyframes } from "styled-components";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PageStack } from "@/components/ui/PagePrimitives";
import { acceptMockMatch, mockFindOpponents } from "@/services/mockLiveMatchService";
import type { MockOpponent } from "@/types/domain";

type FindMatchState = "idle" | "searching" | "found";

export function FindMatchView() {
  const router = useRouter();
  const [state, setState] = useState<FindMatchState>("idle");
  const [opponents, setOpponents] = useState<MockOpponent[]>([]);

  function startSearch() {
    setState("searching");
    setOpponents([]);

    window.setTimeout(() => {
      void mockFindOpponents().then((items) => {
        setOpponents(items);
        setState("found");
      });
    }, Math.floor(2000 + Math.random() * 2000));
  }

  function acceptOpponent(opponent: MockOpponent) {
    acceptMockMatch(opponent);
    router.push("/live-match");
  }

  return (
    <FindMatchShell>
      {state === "idle" ? (
        <CenterStage>
          <RadarButton type="button" onClick={startSearch} aria-label="Find Match">
            <RadarSweep />
            <Radar size={46} />
            <strong>Find Match</strong>
          </RadarButton>
          <h1>Find Match</h1>
          <p>Search for your next opponent</p>
        </CenterStage>
      ) : null}

      {state === "searching" ? (
        <CenterStage>
          <RadarButton type="button" disabled aria-label="Searching for opponent">
            <RadarSweep $active />
            <PulseRing />
            <Radar size={46} />
            <strong>Searching</strong>
          </RadarButton>
          <h1>Searching for opponent...</h1>
          <p>Scanning active Legacy players</p>
        </CenterStage>
      ) : null}

      {state === "found" ? (
        <PageStack>
          <FoundHeader>
            <CheckCircle2 size={26} />
            <div>
              <h1>Match Found</h1>
              <p>Select an opponent to start a live match.</p>
            </div>
          </FoundHeader>
          <OpponentGrid>
            {opponents.map((opponent) => (
              <OpponentCard key={opponent.id}>
                <CardBody>
                  <CardHeader>
                    <div>
                      <span>Ready</span>
                      <h2>{opponent.name}</h2>
                    </div>
                    <ReadyPill>Ready</ReadyPill>
                  </CardHeader>
                  <Stats>
                    <Stat>
                      <span>Rank</span>
                      <strong>{opponent.rank}</strong>
                    </Stat>
                    <Stat>
                      <span>Level</span>
                      <strong>{opponent.level}</strong>
                    </Stat>
                    <Stat>
                      <span>Win rate</span>
                      <strong>{opponent.winRate}%</strong>
                    </Stat>
                  </Stats>
                  <Button type="button" fullWidth onClick={() => acceptOpponent(opponent)}>Accept</Button>
                </CardBody>
              </OpponentCard>
            ))}
          </OpponentGrid>
        </PageStack>
      ) : null}
    </FindMatchShell>
  );
}

const sweep = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(0.78);
    opacity: 0.72;
  }

  100% {
    transform: scale(1.2);
    opacity: 0;
  }
`;

const FindMatchShell = styled.div`
  min-height: calc(100vh - 9rem);
  display: grid;
  align-items: center;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
`;

const CenterStage = styled.div`
  display: grid;
  justify-items: center;
  gap: 0.85rem;
  text-align: center;

  h1 {
    margin: 0.4rem 0 0;
    font-size: clamp(2rem, 10vw, 4.6rem);
    line-height: 0.95;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const RadarButton = styled.button`
  position: relative;
  isolation: isolate;
  width: min(72vw, 18rem);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  gap: 0.5rem;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 999px;
  background:
    radial-gradient(circle at center, rgba(212, 175, 55, 0.22), transparent 34%),
    repeating-radial-gradient(circle at center, rgba(212, 175, 55, 0.16) 0 1px, transparent 1px 2.6rem),
    #0b0b0b;
  color: ${({ theme }) => theme.colors.gold};
  box-shadow: ${({ theme }) => theme.shadows.glowGold};
  cursor: pointer;

  svg,
  strong {
    position: relative;
    z-index: 2;
  }

  strong {
    font-size: 1.1rem;
    text-transform: uppercase;
  }

  &:disabled {
    cursor: wait;
  }
`;

const RadarSweep = styled.span<{ $active?: boolean }>`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: conic-gradient(from 0deg, rgba(212, 175, 55, 0.42), transparent 26%, transparent);
  opacity: 0.7;
  animation: ${sweep} ${({ $active }) => ($active ? "1.15s" : "3.5s")} linear infinite;
`;

const PulseRing = styled.span`
  position: absolute;
  inset: 18%;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 999px;
  animation: ${pulse} 1.2s ease-out infinite;
`;

const FoundHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;

  svg {
    color: ${({ theme }) => theme.colors.gold};
  }

  h1,
  p {
    margin: 0;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const OpponentGrid = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const OpponentCard = styled(Card)`
  border-radius: 8px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  span {
    color: ${({ theme }) => theme.colors.gold};
    font-size: 0.74rem;
    font-weight: 900;
    text-transform: uppercase;
  }

  h2 {
    margin: 0.25rem 0 0;
  }
`;

const ReadyPill = styled.span`
  display: inline-flex;
  height: fit-content;
  border: 1px solid rgba(0, 200, 83, 0.42);
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
  background: rgba(0, 200, 83, 0.12);
  color: ${({ theme }) => theme.colors.success};
`;

const Stats = styled.div`
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Stat = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.surfaceGlass};

  span {
    display: block;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.78rem;
  }

  strong {
    display: block;
    margin-top: 0.3rem;
  }
`;
