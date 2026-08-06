"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Swords, Trophy, Users } from "lucide-react";
import styled from "styled-components";
import { Grid, SectionTitle } from "@/components/ui/PagePrimitives";

const FEATURES = [
  {
    icon: Swords,
    title: "Live Weekly Matches",
    description: "New cycles kick off every week with scheduled matches and real-time score submission."
  },
  {
    icon: ShieldCheck,
    title: "Fair-Play Enforced",
    description: "Screenshot evidence and dispute review keep every submitted result honest."
  },
  {
    icon: Trophy,
    title: "Clear Qualification Path",
    description: "Group stage standings feed directly into grand finale slots — no invitations required."
  },
  {
    icon: Users,
    title: "Global Leaderboards",
    description: "Track rank, XP, and win rate against every active player in the league."
  }
];

export function FeaturesSection() {
  return (
    <Wrap>
      <Inner>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <SectionTitle>
            <div>
              <h2>Why Legacy</h2>
              <p>Built for players who want a real, transparent path to competition.</p>
            </div>
          </SectionTitle>
        </motion.div>

        <Grid $columns={4}>
          {FEATURES.map(({ icon: Icon, title, description }, index) => (
            <Tile
              key={title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <IconMark>
                <Icon size={22} />
              </IconMark>
              <h3>{title}</h3>
              <p>{description}</p>
            </Tile>
          ))}
        </Grid>
      </Inner>
    </Wrap>
  );
}

const Wrap = styled.section`
  padding: 1.5rem 1.25rem 2.5rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 2rem 1.5rem 3.5rem;
  }
`;

const Inner = styled.div`
  width: min(100%, 1280px);
  margin: 0 auto;
  display: grid;
  gap: 1.25rem;
`;

const Tile = styled(motion.div)`
  display: grid;
  gap: 0.6rem;
  align-content: start;
  padding: 1.5rem 1.35rem;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.neumorphicRaised};

  h3 {
    margin: 0;
    font-size: 1.02rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.86rem;
    line-height: 1.5;
  }
`;

const IconMark = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.gold};
  background: ${({ theme }) => theme.colors.goldSoft};
  box-shadow: ${({ theme }) => theme.shadows.neumorphicInset};
`;
