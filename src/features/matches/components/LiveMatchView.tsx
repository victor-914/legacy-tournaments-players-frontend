"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Send } from "lucide-react";
import styled, { css } from "styled-components";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageStack, SectionTitle, TableScroller } from "@/components/ui/PagePrimitives";
import { UploadDropzone } from "@/components/ui/UploadDropzone";
import { useMatchChat } from "@/hooks/useMatchChat";
import { mockApi } from "@/services/mockApi";
import type { LiveMatch, MatchStatus, PastMatch } from "@/types/domain";

export function LiveMatchView({ matchId }: { matchId: string }) {
  const queryClient = useQueryClient();
  const [myScore, setMyScore] = useState("");
  const [opponentScore, setOpponentScore] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>();
  const [formError, setFormError] = useState<string>();

  const matchQuery = useQuery({ queryKey: ["live-match", matchId], queryFn: () => mockApi.getLiveMatch(matchId) });
  const pastMatchesQuery = useQuery({ queryKey: ["past-matches"], queryFn: mockApi.getPastMatches });

  const createRoomCode = useMutation({
    mutationFn: () => mockApi.createRoomCode(matchId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["live-match", matchId] });
    }
  });

  const submitScore = useMutation({
    mutationFn: () => {
      if (!screenshot) {
        throw new Error("Screenshot evidence is required before submitting result.");
      }

      return mockApi.submitMatchScore(matchId, {
        myScore: Number(myScore),
        opponentScore: Number(opponentScore),
        evidence: {
          fileName: screenshot.name,
          mimeType: screenshot.type,
          previewUrl: screenshotPreview
        }
      });
    },
    onSuccess: () => {
      setFormError(undefined);
      void queryClient.invalidateQueries({ queryKey: ["live-match", matchId] });
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "Could not submit score.");
    }
  });

  const playerSubmission = useMemo(
    () => matchQuery.data?.submissions.find((submission) => submission.playerId === matchQuery.data?.player.id),
    [matchQuery.data]
  );

  if (matchQuery.isLoading) {
    return <PageLoader label="Loading live match" />;
  }

  if (matchQuery.isError || !matchQuery.data) {
    return (
      <PageStack>
        <EmptyState>
          <h2>Live match unavailable</h2>
          <p>We could not load this match session.</p>
        </EmptyState>
      </PageStack>
    );
  }

  const match = matchQuery.data;

  function handleScreenshot(file: File | null) {
    setScreenshot(file);
    setScreenshotPreview(file ? URL.createObjectURL(file) : undefined);
    setFormError(undefined);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!screenshot) {
      setFormError("Screenshot evidence is required before submitting result.");
      return;
    }

    if (myScore === "" || opponentScore === "") {
      setFormError("Enter both scores before submitting.");
      return;
    }

    submitScore.mutate();
  }

  return (
    <PageStack>
      <MatchHeader match={match} />

      {match.status === "disputed" ? (
        <DisputeNotice>This match is disputed. Admin review is required.</DisputeNotice>
      ) : null}

      <ToolsGrid>
        <RoomCodeCard match={match} isCreating={createRoomCode.isPending} onCreate={() => createRoomCode.mutate()} />
        <MatchChat matchId={match.id} />
      </ToolsGrid>

      <Card>
        <CardBody>
          <SectionTitle>
            <div>
              <h2>Score Submission</h2>
              <p>Submit your score with screenshot evidence.</p>
            </div>
          </SectionTitle>
          <SubmitForm onSubmit={handleSubmit}>
            <ScoreGrid>
              <Field>
                <span>My Score</span>
                <input min={0} max={99} type="number" value={myScore} onChange={(event) => setMyScore(event.target.value)} />
              </Field>
              <Field>
                <span>Opponent Score</span>
                <input min={0} max={99} type="number" value={opponentScore} onChange={(event) => setOpponentScore(event.target.value)} />
              </Field>
            </ScoreGrid>
            <UploadDropzone fileName={screenshot?.name} onChange={handleScreenshot} />
            {screenshotPreview ? <PreviewImage src={screenshotPreview} alt="Screenshot evidence preview" /> : null}
            {formError ? <ErrorText>{formError}</ErrorText> : null}
            {playerSubmission ? <MutedText>Submitted evidence: {playerSubmission.evidence.fileName}</MutedText> : null}
            <Button type="submit" disabled={submitScore.isPending || match.status === "completed"}>Submit Result</Button>
          </SubmitForm>
        </CardBody>
      </Card>

      <PastMatchesList matches={pastMatchesQuery.data ?? []} isLoading={pastMatchesQuery.isLoading} />
    </PageStack>
  );
}

function MatchHeader({ match }: { match: LiveMatch }) {
  return (
    <HeaderCard>
      <CardBody>
        <HeaderGrid>
          <div>
            <Kicker>{match.season} / {match.cycle}</Kicker>
            <h1>{match.player.gamerTag} vs {match.opponent.gamerTag}</h1>
          </div>
          <StatusPill $status={match.status}>{formatStatus(match.status)}</StatusPill>
        </HeaderGrid>
        <HeaderMeta>
          <span>Group: <strong>{match.groupName ?? "Pending"}</strong></span>
          <span>Match ID: <strong>{match.id}</strong></span>
        </HeaderMeta>
      </CardBody>
    </HeaderCard>
  );
}

function RoomCodeCard({ match, isCreating, onCreate }: { match: LiveMatch; isCreating: boolean; onCreate: () => void }) {
  function copyRoomCode() {
    if (match.roomCode) {
      void navigator.clipboard?.writeText(match.roomCode);
    }
  }

  return (
    <Card>
      <CardBody>
        <SectionTitle>
          <div>
            <h2>Room Code / Demo Code</h2>
            <p>Create and share the code for this match.</p>
          </div>
        </SectionTitle>
        {match.roomCode ? (
          <RoomCode>
            <strong>{match.roomCode}</strong>
            <Button type="button" variant="secondary" onClick={copyRoomCode}><Copy size={17} /> Copy</Button>
          </RoomCode>
        ) : (
          <Button type="button" disabled={isCreating} onClick={onCreate}>Create Room Code</Button>
        )}
      </CardBody>
    </Card>
  );
}

function MatchChat({ matchId }: { matchId: string }) {
  const [message, setMessage] = useState("");
  const { messages, sendMessage } = useMatchChat(matchId);

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();

    if (!trimmed) return;

    sendMessage.mutate(trimmed, {
      onSuccess: () => setMessage("")
    });
  }

  return (
    <Card>
      <CardBody>
        <SectionTitle>
          <div>
            <h2>Match Chat</h2>
            <p>Messages are scoped to this match.</p>
          </div>
        </SectionTitle>
        <ChatLog>
          {(messages.data ?? []).map((item) => (
            <ChatMessage key={item.id}>
              <strong>{item.senderName}</strong>
              <span>{formatTime(item.createdAt)}</span>
              <p>{item.message}</p>
            </ChatMessage>
          ))}
          {!messages.isLoading && !messages.data?.length ? <MutedText>No messages yet.</MutedText> : null}
        </ChatLog>
        <ChatForm onSubmit={submitMessage}>
          <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message opponent" />
          <Button type="submit" disabled={sendMessage.isPending}><Send size={17} /> Send</Button>
        </ChatForm>
      </CardBody>
    </Card>
  );
}

function PastMatchesList({ matches, isLoading }: { matches: PastMatch[]; isLoading: boolean }) {
  return (
    <Card>
      <CardBody>
        <SectionTitle>
          <div>
            <h2>Past Matches</h2>
            <p>Recent completed group matches.</p>
          </div>
        </SectionTitle>
        {isLoading ? (
          <MutedText>Loading past matches...</MutedText>
        ) : (
          <TableScroller>
            <Table>
              <thead>
                <tr>
                  <th>Opponent</th>
                  <th>Score</th>
                  <th>Result</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.id}>
                    <td>{match.opponent.gamerTag}</td>
                    <td>{match.score}</td>
                    <td>{formatStatus(match.result)}</td>
                    <td>{formatStatus(match.status)}</td>
                    <td>{formatDate(match.date)}</td>
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

function formatStatus(status: MatchStatus | "win" | "loss"): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}

const HeaderCard = styled(Card)`
  h1 {
    margin: 0.3rem 0 0;
    font-size: clamp(1.45rem, 5vw, 2.4rem);
    line-height: 1.1;
  }
`;

const HeaderGrid = styled.div`
  display: grid;
  gap: 0.75rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
  }
`;

const HeaderMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  margin-top: 1rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ToolsGrid = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(18rem, 0.8fr) minmax(0, 1.2fr);
  }
`;

const Kicker = styled.span`
  color: ${({ theme }) => theme.colors.gold};
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
`;

const StatusPill = styled.span<{ $status: MatchStatus }>`
  display: inline-flex;
  width: fit-content;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;

  ${({ $status, theme }) =>
    $status === "live" &&
    css`
      border-color: ${theme.colors.borderStrong};
      background: ${theme.colors.goldSoft};
      color: ${theme.colors.gold};
    `}

  ${({ $status, theme }) =>
    $status === "completed" &&
    css`
      border-color: rgba(0, 200, 83, 0.42);
      background: rgba(0, 200, 83, 0.12);
      color: ${theme.colors.success};
    `}

  ${({ $status, theme }) =>
    $status === "disputed" &&
    css`
      border-color: rgba(255, 59, 48, 0.5);
      background: rgba(255, 59, 48, 0.12);
      color: ${theme.colors.error};
    `}
`;

const DisputeNotice = styled.div`
  border: 1px solid rgba(255, 59, 48, 0.5);
  border-radius: 8px;
  padding: 1rem;
  background: rgba(255, 59, 48, 0.12);
  color: ${({ theme }) => theme.colors.error};
  font-weight: 800;
`;

const RoomCode = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  strong {
    color: ${({ theme }) => theme.colors.gold};
    font-size: 1.6rem;
    letter-spacing: 0.08em;
  }
`;

const ChatLog = styled.div`
  display: grid;
  gap: 0.75rem;
  max-height: 16rem;
  overflow-y: auto;
  padding-right: 0.25rem;
`;

const ChatMessage = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.2rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.surfaceGlass};

  span {
    color: ${({ theme }) => theme.colors.textDim};
    font-size: 0.78rem;
  }

  p {
    grid-column: 1 / -1;
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const ChatForm = styled.form`
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-bottom: env(safe-area-inset-bottom);

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  input {
    min-height: 3rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.surfaceGlass};
    color: ${({ theme }) => theme.colors.text};
    padding: 0 0.9rem;
  }
`;

const SubmitForm = styled.form`
  display: grid;
  gap: 1rem;
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
`;

const ScoreGrid = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Field = styled.label`
  display: grid;
  gap: 0.4rem;
  color: ${({ theme }) => theme.colors.textMuted};

  input {
    min-height: 3rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.surfaceGlass};
    color: ${({ theme }) => theme.colors.text};
    padding: 0 0.9rem;
  }
`;

const PreviewImage = styled.img`
  width: min(100%, 22rem);
  max-height: 13rem;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
`;

const MutedText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ErrorText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.error};
`;

const EmptyState = styled(CardBody)`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surfaceElevated};

  h2,
  p {
    margin: 0;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Table = styled.table`
  width: 100%;
  min-width: 34rem;
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
