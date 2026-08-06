"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import styled from "styled-components";
import { Grid, SectionTitle } from "@/components/ui/PagePrimitives";
import { TournamentTeaserCard } from "@/features/home/components/TournamentTeaserCard";
import { tournaments } from "@/constants/mockData";
import { TournamentStatus } from "@/types/domain";

const ONGOING = tournaments.filter((tournament) => tournament.status !== TournamentStatus.Completed);

export function TournamentsTeaserSection() {
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

        <Grid $columns={3}>
          {ONGOING.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <TournamentTeaserCard tournament={tournament} />
            </motion.div>
          ))}
        </Grid>
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
