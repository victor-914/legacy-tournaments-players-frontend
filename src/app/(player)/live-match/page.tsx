"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { Card, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageStack } from "@/components/ui/PagePrimitives";
import { mockApi } from "@/services/mockApi";
import type { FindMatch } from "@/types/domain";

const activeStatuses = new Set<string>(["pending", "live", "current"]);

export default function LiveMatchPage() {
  const router = useRouter();
  const matchesQuery = useQuery({ queryKey: ["find-matches"], queryFn: mockApi.getFindMatches });
  const activeMatch = matchesQuery.data?.find(isActiveMatch);

  useEffect(() => {
    if (activeMatch) {
      router.replace(`/matches/${activeMatch.id}/live`);
    }
  }, [activeMatch, router]);

  if (matchesQuery.isLoading || activeMatch) {
    return <PageLoader label="Finding active match" />;
  }

  return (
    <PageStack>
      <EmptyState>
        <CardBody>
          <h2>No active match</h2>
          <p>You do not have a pending or live match right now.</p>
          <ActionLink href="/find-match">Find Match</ActionLink>
        </CardBody>
      </EmptyState>
    </PageStack>
  );
}

function isActiveMatch(match: FindMatch) {
  return activeStatuses.has(match.status);
}

const EmptyState = styled(Card)`
  width: min(100%, 34rem);

  h2,
  p {
    margin: 0;
  }

  p {
    margin-top: 0.4rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const ActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.8rem;
  margin-top: 1rem;
  border-radius: 8px;
  padding: 0 1.1rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.gold}, #8d6d16);
  color: #090909;
  box-shadow: ${({ theme }) => theme.shadows.glowGold};
  font-weight: 900;
`;
