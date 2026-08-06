"use client";

import { motion } from "framer-motion";
import styled from "styled-components";
import { SectionTitle } from "@/components/ui/PagePrimitives";
import { teamMembers } from "@/constants/aboutContent";

export function TeamSection() {
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
              <h2>Meet the Team</h2>
              <p>The people running seasons, matches, and events week to week.</p>
            </div>
          </SectionTitle>
        </motion.div>

        <Grid>
          {teamMembers.map((member, index) => (
            <Person
              key={member.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              whileHover={{ y: -5 }}
            >
              <Avatar>
                <img src={member.avatar} alt={member.name} loading="lazy" />
              </Avatar>
              <h3>{member.name}</h3>
              <Role>{member.role}</Role>
              <Bio>{member.bio}</Bio>
            </Person>
          ))}
        </Grid>
      </Inner>
    </Wrap>
  );
}

const Wrap = styled.section`
  padding: 1.5rem 1.25rem 3rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 2rem 1.5rem 4rem;
  }
`;

const Inner = styled.div`
  width: min(100%, 1280px);
  margin: 0 auto;
  display: grid;
  gap: 1.25rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15.5rem, 1fr));
  gap: 1.1rem;
`;

const Person = styled(motion.article)`
  display: grid;
  gap: 0.5rem;
  padding: 1.5rem;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(18px);
  box-shadow: ${({ theme }) => theme.shadows.panel};

  h3 {
    margin: 0.4rem 0 0;
    font-size: 1.05rem;
  }
`;

const Avatar = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.neumorphicRaised};

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Role = styled.p`
  margin: 0;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.gold};
`;

const Bio = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.86rem;
  line-height: 1.5;
`;
