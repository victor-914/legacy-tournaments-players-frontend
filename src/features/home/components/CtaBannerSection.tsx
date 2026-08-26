"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";

export function CtaBannerSection() {
  return (
    <Wrap>
      <Inner
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2>Ready to compete?</h2>
          <p>Create your account, submit your qualification stats, and get placed into the next group stage.</p>
        </div>
        <Link href="/register">
          <Button variant="primary">Join Tournaments</Button>
        </Link>
      </Inner>
    </Wrap>
  );
}

const Wrap = styled.section`
  padding: 1.5rem 1.25rem 3.5rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 2rem 1.5rem 5rem;
  }
`;

const Inner = styled(motion.div)`
  width: min(100%, 1280px);
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1.75rem 1.35rem;
  border-radius: 18px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.goldSoft}, ${({ theme }) => theme.colors.surface});
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  box-shadow: ${({ theme }) => theme.shadows.glowGold};

  h2 {
    margin: 0 0 0.4rem;
    font-size: 1.3rem;
  }

  p {
    margin: 0;
    max-width: 32rem;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.92rem;
  }

  /* The banner wraps to two rows on phones, where a left-aligned auto-width
     button reads as an afterthought under the copy. */
  > a,
  > a > button {
    width: 100%;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    > a,
    > a > button {
      width: auto;
    }
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    gap: 1.5rem;
    padding: 2.25rem 2rem;

    h2 {
      font-size: 1.6rem;
    }

    p {
      font-size: 1rem;
    }
  }
`;
