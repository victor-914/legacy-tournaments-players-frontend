"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { ApprovalNotice } from "@/components/auth/ApprovalNotice";
import { Card, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageStack } from "@/components/ui/PagePrimitives";
import { mockApi } from "@/services/mockApi";
import { playerService } from "@/services/playerService";
import type { FindMatch, LiveMatch } from "@/types/domain";
import { isApprovedPlayer } from "@/utils/approval";

const unresolvedStatuses = new Set<string>([
  "pending",
  "live",
  "current",
  "played",
  "pending_admin_approval",
  "disputed"
]);

export default function LiveMatchPage() {
  const router = useRouter();
  const meQuery = useQuery({ queryKey: ["players-me"], queryFn: playerService.getMe });
  const approved = isApprovedPlayer(meQuery.data);
  const matchesQuery = useQuery({
    queryKey: ["find-matches"],
    queryFn: mockApi.getFindMatches,
    enabled: approved
  });
  const disputedMatchesQuery = useQuery({
    queryKey: ["live-match-disputes", matchesQuery.data?.map((match) => match.id).join(",")],
    queryFn: async () => {
      const disputedMatches = (matchesQuery.data ?? []).filter((match) => match.status === "disputed");
      const details = await Promise.all(disputedMatches.map((match) => mockApi.getLiveMatch(match.id)));
      return details.filter(needsPlayerEvidence);
    },
    enabled: approved && Boolean(matchesQuery.data?.some((match) => match.status === "disputed"))
  });
  const disputedMatchesNeedingEvidence = disputedMatchesQuery.data ?? [];
  const activeMatch = matchesQuery.data?.find((match) => isUnresolvedMatch(match) && match.status !== "disputed");

  useEffect(() => {
    if (activeMatch && disputedMatchesNeedingEvidence.length === 0) {
      router.replace(`/matches/${activeMatch.id}/live`);
    }
  }, [activeMatch, disputedMatchesNeedingEvidence.length, router]);

  if (meQuery.isLoading || matchesQuery.isLoading || disputedMatchesQuery.isLoading || (activeMatch && disputedMatchesNeedingEvidence.length === 0)) {
    return <PageLoader label="Finding active match" />;
  }

  if (!approved) {
    return (
      <PageStack>
        <ApprovalNotice />
      </PageStack>
    );
  }

  if (disputedMatchesNeedingEvidence.length > 0) {
    return (
      <PageStack>
        <DisputeList>
          <CardBody>
            <h2>Screenshot evidence required</h2>
            <p>Both players must upload screenshots before admin can resolve a disputed match.</p>
            <MatchGrid>
              {disputedMatchesNeedingEvidence.map((match) => (
                <DisputeMatchCard key={match.id}>
                  <strong>{match.player.gamerTag} vs {match.opponent.gamerTag}</strong>
                  <span>Match ID: {match.id}</span>
                  <ActionLink href={`/matches/${match.id}/live`}>Upload Screenshot</ActionLink>
                </DisputeMatchCard>
              ))}
            </MatchGrid>
          </CardBody>
        </DisputeList>
      </PageStack>
    );
  }

  return (
    <PageStack>
      <EmptyState>
        <CardBody>
          <h2>No active match</h2>
          <p>You do not have a pending, live, or disputed match that needs your attention right now.</p>
          <ActionLink href="/find-match">Find Match</ActionLink>
        </CardBody>
      </EmptyState>
    </PageStack>
  );
}

function isUnresolvedMatch(match: FindMatch) {
  return unresolvedStatuses.has(match.status);
}

function hasRealEvidence(evidence: LiveMatch["submissions"][number]["evidence"]): boolean {
  if (!evidence) {
    return false;
  }
  if (typeof evidence === "string") {
    return evidence !== "pending-dispute-evidence";
  }
  return Boolean(evidence.previewUrl || evidence.fileName);
}

function needsPlayerEvidence(match: LiveMatch): boolean {
  const playerSubmission = match.submissions.find((submission) => submission.playerId === match.player.id);
  return !playerSubmission || !hasRealEvidence(playerSubmission.evidence);
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

const DisputeList = styled(Card)`
  width: min(100%, 48rem);

  h2,
  p {
    margin: 0;
  }

  p {
    margin-top: 0.4rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const MatchGrid = styled.div`
  display: grid;
  gap: 0.8rem;
  margin-top: 1rem;
`;

const DisputeMatchCard = styled.div`
  display: grid;
  gap: 0.4rem;
  border: 1px solid rgba(255, 59, 48, 0.5);
  border-radius: 8px;
  background: rgba(255, 59, 48, 0.08);
  padding: 0.9rem;

  strong {
    color: ${({ theme }) => theme.colors.text};
  }

  span {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.9rem;
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
