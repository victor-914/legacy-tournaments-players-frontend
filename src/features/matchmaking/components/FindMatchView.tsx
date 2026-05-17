"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import styled from "styled-components";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PageStack } from "@/components/ui/PagePrimitives";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { players, upcomingMatch } from "@/constants/mockData";

type MatchmakingState = "idle" | "searching" | "found";

export function FindMatchView() {
  const [state, setState] = useState<MatchmakingState>("idle");
  const [wait, setWait] = useState(() => Math.floor(35 + Math.random() * 55));

  function startSearch() {
    setWait(Math.floor(35 + Math.random() * 55));
    setState("searching");
    window.setTimeout(() => setState("found"), 1800);
  }

  return (
    <PageStack>
      <Arena>
        <CardBody>
          <MatchmakingCore>
            <PulseRing animate={{ scale: [1, 1.14, 1], opacity: [0.55, 1, 0.55] }} transition={{ repeat: Infinity, duration: 1.4 }} />
            <Swords size={56} />
            <h1>{state === "found" ? "Match Found" : state === "searching" ? "Searching Arena" : "Find Competitive Match"}</h1>
            <p>{state === "found" ? upcomingMatch.id : state === "searching" ? `Estimated wait ${wait}s` : "Queue into your active weekly group stage."}</p>
            {state === "idle" ? <Button onClick={startSearch}>Find Match</Button> : null}
            {state === "searching" ? <Button variant="secondary" onClick={() => setState("idle")}>Cancel Search</Button> : null}
          </MatchmakingCore>
        </CardBody>
      </Arena>

      {state === "found" ? (
        <Versus initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <PlayerCard player={players[0]} highlight rankLabel="You" />
          <Vs>VS</Vs>
          <PlayerCard player={upcomingMatch.opponent} highlight rankLabel="Opponent" />
          <MatchMeta>
            <Badge label={upcomingMatch.groupName} tone="gold" />
            <span>Match ID: {upcomingMatch.id}</span>
            <strong>Both players pending ready check</strong>
          </MatchMeta>
        </Versus>
      ) : null}
    </PageStack>
  );
}

const Arena = styled(Card)`
  min-height: 30rem;
  display: grid;
  place-items: center;
  text-align: center;
`;

const MatchmakingCore = styled.div`
  position: relative;
  display: grid;
  justify-items: center;
  gap: 1rem;

  svg {
    color: ${({ theme }) => theme.colors.gold};
    filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.55));
  }

  h1 {
    margin: 0;
    font-size: clamp(2.2rem, 9vw, 5.5rem);
    line-height: 0.95;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const PulseRing = styled(motion.div)`
  position: absolute;
  width: min(64vw, 20rem);
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  box-shadow: ${({ theme }) => theme.shadows.glowGold};
`;

const Versus = styled(motion.div)`
  display: grid;
  gap: 1rem;
  align-items: center;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr auto 1fr;
  }
`;

const Vs = styled.div`
  color: ${({ theme }) => theme.colors.gold};
  font-size: 2.5rem;
  font-weight: 900;
  text-align: center;
`;

const MatchMeta = styled(Card)`
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-column: 1 / -1;
  }

  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;
