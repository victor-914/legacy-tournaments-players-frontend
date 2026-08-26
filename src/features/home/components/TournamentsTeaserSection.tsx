"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/PageLoader";
import { Grid, SectionTitle } from "@/components/ui/PagePrimitives";
import { TournamentTeaserCard } from "@/features/home/components/TournamentTeaserCard";
import { usePublicLeaderboardLive } from "@/features/public-leaderboard/hooks/usePublicLeaderboardLive";
import { publicLeaderboardService } from "@/features/public-leaderboard/services/publicLeaderboardService";

const PAST_CYCLES_SHOWN = 3;

export function TournamentsTeaserSection() {
  // Keeps the player counts in step with the live leaderboard the same way the
  // public leaderboard page does.
  usePublicLeaderboardLive();

  const cyclesQuery = useQuery({
    queryKey: ["public-cycles"],
    queryFn: () => publicLeaderboardService.getPublicCycles()
  });
  const leaderboardQuery = useQuery({
    queryKey: ["public-leaderboard"],
    queryFn: () => publicLeaderboardService.getPublicLeaderboard()
  });
  // No cycleId: the public groups endpoint defaults to the active cycle, and
  // this reuses the cache entry the leaderboard page primes.
  const groupsQuery = useQuery({
    queryKey: ["public-groups"],
    queryFn: () => publicLeaderboardService.getPublicGroups()
  });

  const cycles = cyclesQuery.data ?? [];
  const ongoing = cycles.filter((cycle) => cycle.status === "active");
  // Newest first, capped so the homepage stays a teaser — the full history
  // lives on the leaderboard page's cycle selector.
  const past = cycles
    .filter((cycle) => cycle.status === "completed")
    .sort((a, b) => b.cycleNumber - a.cycleNumber)
    .slice(0, PAST_CYCLES_SHOWN);

  return (
    <Wrap id="tournaments">
      <Inner>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <SectionTitle>
            <div>
              <h2>Ongoing Tournaments</h2>
              <p>Live cycles and qualifiers happening right now.</p>
            </div>
            <Link href="/leaderboard">See live leaderboard</Link>
          </SectionTitle>
        </motion.div>

        {cyclesQuery.isLoading ? <PageLoader label="Loading ongoing tournaments" /> : null}

        {cyclesQuery.isError ? (
          <Card>
            <Notice>
              <strong>Tournaments unavailable</strong>
              <p>We could not reach the server. Try again in a moment.</p>
              <Button
                variant="secondary"
                onClick={() => void cyclesQuery.refetch()}
                disabled={cyclesQuery.isFetching}
              >
                {cyclesQuery.isFetching ? "Retrying..." : "Retry"}
              </Button>
            </Notice>
          </Card>
        ) : null}

        {!cyclesQuery.isLoading && !cyclesQuery.isError && ongoing.length === 0 ? (
          <Card>
            <Notice>
              <strong>No tournaments are running right now</strong>
              <p>Register now and you will be in the pool when the next cycle opens.</p>
              <Link href="/register">
                <Button variant="secondary">Create player account</Button>
              </Link>
            </Notice>
          </Card>
        ) : null}

        {ongoing.length > 0 ? (
          <Grid $columns={3}>
            {ongoing.map((cycle, index) => (
              <motion.div
                key={cycle.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <TournamentTeaserCard
                  cycle={cycle}
                  seasonName={leaderboardQuery.data?.seasonName}
                  // The leaderboard and groups endpoints serve the active cycle
                  // only, so attach their counts to that cycle alone.
                  playerCount={leaderboardQuery.data?.cycleId === cycle.id ? leaderboardQuery.data.total : undefined}
                  groupCount={leaderboardQuery.data?.cycleId === cycle.id ? groupsQuery.data?.length : undefined}
                />
              </motion.div>
            ))}
          </Grid>
        ) : null}

        {past.length > 0 ? (
          <PastBlock>
            <SectionTitle>
              <div>
                <h2>Past Cycles</h2>
                <p>Completed cycles from this season.</p>
              </div>
              <Link href="/leaderboard">Browse full history</Link>
            </SectionTitle>

            <Grid $columns={3}>
              {past.map((cycle, index) => (
                <motion.div
                  key={cycle.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                >
                  <TournamentTeaserCard cycle={cycle} seasonName={leaderboardQuery.data?.seasonName} />
                </motion.div>
              ))}
            </Grid>
          </PastBlock>
        ) : null}
      </Inner>
    </Wrap>
  );
}

const Wrap = styled.section`
  padding: 1.5rem 1.25rem;
  scroll-margin-top: 5rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 2rem 1.5rem;
  }
`;

const Inner = styled.div`
  width: min(100%, 1280px);
  margin: 0 auto;
  display: grid;
  gap: 1.25rem;

  a {
    font-size: 0.85rem;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.gold};
    white-space: nowrap;
  }
`;

const PastBlock = styled.div`
  display: grid;
  gap: 1.25rem;
  margin-top: 1rem;
  padding-top: 1.75rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Notice = styled(CardBody)`
  display: grid;
  justify-items: start;
  gap: 0.6rem;

  strong {
    font-size: 1.05rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;
