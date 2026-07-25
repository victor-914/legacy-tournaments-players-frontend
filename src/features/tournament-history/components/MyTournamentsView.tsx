"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import { ApprovalNotice } from "@/components/auth/ApprovalNotice";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageStack, SectionTitle, TableScroller } from "@/components/ui/PagePrimitives";
import { UploadDropzone } from "@/components/ui/UploadDropzone";
import { playerTournamentsQueryKey, usePlayerTournaments } from "@/features/tournament-history/hooks/usePlayerTournaments";
import { tournamentHistoryService } from "@/features/tournament-history/services/tournamentHistoryService";
import type { PlayerTournamentEntry } from "@/features/tournament-history/types";
import { uploadStatScreenshot } from "@/services/registrationService";
import { playerService } from "@/services/playerService";
import { isApprovedPlayer } from "@/utils/approval";

type ActiveCycleState = "join" | "pending" | "active" | "none";

export function MyTournamentsView() {
  const meQuery = useQuery({ queryKey: ["players-me"], queryFn: playerService.getMe });
  const approved = isApprovedPlayer(meQuery.data);
  const tournamentsQuery = usePlayerTournaments(approved);
  const [justSubmitted, setJustSubmitted] = useState(false);

  if (meQuery.isLoading) {
    return <PageLoader label="Loading tournament history" />;
  }

  if (!approved) {
    return (
      <PageStack>
        <ApprovalNotice />
      </PageStack>
    );
  }

  if (tournamentsQuery.isLoading) {
    return <PageLoader label="Loading tournament history" />;
  }

  if (tournamentsQuery.isError) {
    return (
      <PageStack>
        <EmptyCard>
          <CardBody>
            <h2>Tournament History Unavailable</h2>
            <p>We could not load your tournament history right now.</p>
          </CardBody>
        </EmptyCard>
      </PageStack>
    );
  }

  const data = tournamentsQuery.data;
  const activeCycle = data?.activeCycle ?? null;
  const pastCycles = data?.pastCycles ?? [];
  const state = getActiveCycleState(activeCycle, justSubmitted);

  return (
    <PageStack>
      <SectionTitle>
        <div>
          <h2>My Tournaments</h2>
          <p>Your active cycle and past tournament results.</p>
        </div>
      </SectionTitle>

      {state === "join" ? (
        <JoinActiveTournamentCard
          rejected={normalizeStatus(activeCycle?.approvalStatus) === "rejected"}
          onJoined={() => setJustSubmitted(true)}
        />
      ) : state === "pending" ? (
        <PendingActiveCycleCard />
      ) : state === "active" && activeCycle ? (
        <ActiveCycleCard entry={activeCycle} />
      ) : (
        <EmptyCard>
          <CardBody>
            <h2>Active Cycle</h2>
            <p>No active cycle information is available right now.</p>
          </CardBody>
        </EmptyCard>
      )}

      <PastTournamentsCard entries={pastCycles} />
    </PageStack>
  );
}

function getActiveCycleState(activeCycle: PlayerTournamentEntry | null, justSubmitted: boolean): ActiveCycleState {
  if (justSubmitted) return "pending";

  const status = normalizeStatus(activeCycle?.approvalStatus);
  if (!activeCycle || status === "rejected") return "join";
  if (status === "pending") return "pending";

  return "active";
}

function JoinActiveTournamentCard({ rejected, onJoined }: { rejected: boolean; onJoined: () => void }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>();

  const joinMutation = useMutation({
    mutationFn: async (selected: File) => {
      const upload = await uploadStatScreenshot(selected);
      await tournamentHistoryService.joinActiveCycle(upload);
    },
    onSuccess: () => {
      onJoined();
      void queryClient.invalidateQueries({ queryKey: playerTournamentsQueryKey });
    },
    onError: (mutationError: unknown) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to submit your join request.");
    }
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!file) {
      setError("Upload a stat screenshot to join the active tournament.");
      return;
    }

    setError(undefined);
    joinMutation.mutate(file);
  }

  return (
    <HighlightedCard>
      <CardBody>
        <CardHeader>
          <div>
            <Kicker>Active Tournament</Kicker>
            <h3>{rejected ? "Your last join request was rejected" : "Join Active Tournament"}</h3>
          </div>
        </CardHeader>
        <MutedText>
          {rejected
            ? "Upload a fresh stat screenshot to request another spot in the active cycle."
            : "You are not part of the active cycle yet. Upload a stat screenshot to request a spot."}
        </MutedText>
        <Form onSubmit={handleSubmit}>
          <UploadDropzone fileName={file?.name} onChange={setFile} />
          <Button type="submit" disabled={joinMutation.isPending}>
            {joinMutation.isPending ? "Submitting..." : "Join Active Tournament"}
          </Button>
          {error ? <ErrorText>{error}</ErrorText> : null}
        </Form>
      </CardBody>
    </HighlightedCard>
  );
}

function PendingActiveCycleCard() {
  return (
    <HighlightedCard>
      <CardBody>
        <Kicker>Active Tournament</Kicker>
        <h3>Join Request Pending</h3>
        <MutedText>Your join request is waiting for admin approval. You will be added to the active cycle once approved.</MutedText>
      </CardBody>
    </HighlightedCard>
  );
}

function ActiveCycleCard({ entry }: { entry: PlayerTournamentEntry }) {
  const cycle = entry.cycle;

  return (
    <Card>
      <CardBody>
        <CardHeader>
          <div>
            <Kicker>Active Cycle</Kicker>
            <h3>{cycle.name ?? "Active Cycle"}</h3>
          </div>
          <StatusPill>{formatStatusText(cycle.status)}</StatusPill>
        </CardHeader>
        <MetaGrid>
          <MetaItem>
            <span>Dates</span>
            <strong>{formatDateRange(cycle.startDate, cycle.endDate)}</strong>
          </MetaItem>
          <MetaItem>
            <span>Current Rank</span>
            <strong>{entry.rank ? `#${entry.rank}` : "Not ranked"}</strong>
          </MetaItem>
          <MetaItem>
            <span>Group</span>
            <strong>{entry.groupName ?? "Pending"}</strong>
          </MetaItem>
          <MetaItem>
            <span>Prize to be won</span>
            <strong>{formatPrize(cycle.prize)}</strong>
          </MetaItem>
        </MetaGrid>
      </CardBody>
    </Card>
  );
}

function PastTournamentsCard({ entries }: { entries: PlayerTournamentEntry[] }) {
  return (
    <Card>
      <CardBody>
        <CardHeader>
          <div>
            <Kicker>History</Kicker>
            <h3>Past Tournaments</h3>
          </div>
        </CardHeader>
        {entries.length === 0 ? (
          <MutedText>No completed tournaments yet.</MutedText>
        ) : (
          <TableScroller>
            <Table>
              <thead>
                <tr>
                  <th>Cycle</th>
                  <th>Dates</th>
                  <th>Placement</th>
                  <th>Qualification</th>
                  <th>Prize Won</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.cycle.id ?? index}>
                    <td>{entry.cycle.name ?? "Cycle"}</td>
                    <td>{formatDateRange(entry.cycle.startDate, entry.cycle.endDate)}</td>
                    <td>{formatPlacement(entry)}</td>
                    <td>{formatStatusText(entry.qualificationStatus) || "-"}</td>
                    <td>{formatPrize(entry.prizeWon)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableScroller>
        )}
      </CardBody>
    </Card>
  );
}

function normalizeStatus(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

function formatPlacement(entry: PlayerTournamentEntry): string {
  if (entry.finalPlacement) return `#${entry.finalPlacement}`;
  if (entry.rank) return `#${entry.rank}`;
  return "-";
}

function formatPrize(value?: string | number | null): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "number") return new Intl.NumberFormat("en-US").format(value);

  return value.trim() || "—";
}

function formatStatusText(value?: string | null): string {
  if (!value) return "";

  return value
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) return "Not available";
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function formatDate(value?: string): string {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

const EmptyCard = styled(Card)`
  h2,
  p {
    margin: 0;
  }

  p {
    margin-top: 0.6rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const HighlightedCard = styled(Card)`
  border-color: ${({ theme }) => theme.colors.borderStrong};
  box-shadow: ${({ theme }) => theme.shadows.glowGold};

  h3 {
    margin: 0.2rem 0 0.6rem;
    font-size: 1.1rem;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  h3 {
    margin: 0.2rem 0 0;
    font-size: 1.1rem;
  }
`;

const Kicker = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.gold};
  font-size: 0.74rem;
  font-weight: 900;
  text-transform: uppercase;
`;

const MutedText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const MetaGrid = styled.div`
  display: grid;
  gap: 0.75rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const MetaItem = styled.div`
  display: grid;
  gap: 0.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 0.8rem;
  background: ${({ theme }) => theme.colors.surfaceGlass};

  span {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.78rem;
  }

  strong {
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const StatusPill = styled.span`
  display: inline-flex;
  width: fit-content;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 999px;
  padding: 0.28rem 0.55rem;
  background: ${({ theme }) => theme.colors.goldSoft};
  color: ${({ theme }) => theme.colors.gold};
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
`;

const ErrorText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.error};
`;

const Table = styled.table`
  width: 100%;
  min-width: 40rem;
  border-collapse: collapse;

  th,
  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding: 0.8rem 0.65rem;
    text-align: left;
    white-space: nowrap;
  }

  th {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.74rem;
    text-transform: uppercase;
  }
`;
