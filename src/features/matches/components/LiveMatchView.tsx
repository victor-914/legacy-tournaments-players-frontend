"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Clock, Copy, Send } from "lucide-react";
import styled, { css } from "styled-components";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ApprovalNotice } from "@/components/auth/ApprovalNotice";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageStack, SectionTitle, TableScroller } from "@/components/ui/PagePrimitives";
import { UploadDropzone } from "@/components/ui/UploadDropzone";
import { useMatchChat } from "@/hooks/useMatchChat";
import { mockApi } from "@/services/mockApi";
import { playerService } from "@/services/playerService";
import type { LiveMatch, MatchScoreSubmission, MatchStatus, PastMatch } from "@/types/domain";
import { isApprovedPlayer } from "@/utils/approval";

export function LiveMatchView({ matchId }: { matchId: string }) {
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ["players-me"], queryFn: playerService.getMe });
  const approved = isApprovedPlayer(meQuery.data);
  const [myScore, setMyScore] = useState("");
  const [opponentScore, setOpponentScore] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>();
  const [rejectReason, setRejectReason] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [formError, setFormError] = useState<string>();

  const matchQuery = useQuery({
    queryKey: ["live-match", matchId],
    queryFn: () => mockApi.getLiveMatch(matchId),
    enabled: approved
  });
  const pastMatchesQuery = useQuery({ queryKey: ["past-matches"], queryFn: mockApi.getPastMatches, enabled: approved });

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
        evidenceFile: screenshot
      });
    },
    onSuccess: (updatedMatch) => {
      setFormError(undefined);
      setScreenshot(null);
      setScreenshotPreview(undefined);
      setMyScore("");
      setOpponentScore("");
      queryClient.setQueryData(["live-match", matchId], updatedMatch);
      void queryClient.invalidateQueries({ queryKey: ["live-match", matchId] });
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "Could not submit score.");
    }
  });
  const acceptResult = useMutation({
    mutationFn: (resultId: string) => mockApi.acceptMatchResult(matchId, resultId),
    onSuccess: (updatedMatch) => {
      queryClient.setQueryData(["live-match", matchId], updatedMatch);
      void queryClient.invalidateQueries({ queryKey: ["live-match", matchId] });
    }
  });
  const rejectResult = useMutation({
    mutationFn: (payload: { resultId: string; reason: string }) =>
      mockApi.rejectMatchResult(matchId, payload.resultId, { reason: payload.reason }),
    onSuccess: (updatedMatch) => {
      setRejectReason("");
      queryClient.setQueryData(["live-match", matchId], updatedMatch);
      void queryClient.invalidateQueries({ queryKey: ["live-match", matchId] });
    }
  });
  const uploadEvidence = useMutation({
    mutationFn: (payload: { disputeId: string; file: File; note?: string }) =>
      mockApi.uploadDisputeEvidence(matchId, payload.disputeId, {
        evidenceFile: payload.file,
        note: payload.note
      }),
    onSuccess: (updatedMatch) => {
      setEvidenceNote("");
      setScreenshot(null);
      setScreenshotPreview(undefined);
      queryClient.setQueryData(["live-match", matchId], updatedMatch);
      void queryClient.invalidateQueries({ queryKey: ["live-match", matchId] });
    }
  });

  const playerSubmission = useMemo(
    () => matchQuery.data?.submissions.find((submission) => submission.playerId === matchQuery.data?.player.id),
    [matchQuery.data]
  );
  const opponentSubmission = useMemo(
    () => matchQuery.data?.submissions.find((submission) => submission.playerId === matchQuery.data?.opponent.id),
    [matchQuery.data]
  );

  if (meQuery.isLoading || matchQuery.isLoading) {
    return <PageLoader label="Loading live match" />;
  }

  if (!approved) {
    return (
      <PageStack>
        <ApprovalNotice />
      </PageStack>
    );
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
  const resultId = match.resultId ?? playerSubmission?.id ?? opponentSubmission?.id;
  const isLoser = Boolean(match.loserId && match.player.id === match.loserId);
  const isWinner = Boolean(match.winnerId && match.player.id === match.winnerId);

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

    const my = Number(myScore);
    const opp = Number(opponentScore);
    if (my <= opp) {
      setFormError("Draws are not allowed. Winner score must be greater than loser score.");
      return;
    }

    submitScore.mutate();
  }

  return (
    <PageStack>
      <MatchHeader match={match} />

      <ToolsGrid>
        <RoomCodeCard match={match} isCreating={createRoomCode.isPending} onCreate={() => createRoomCode.mutate()} />
        <MatchChat matchId={match.id} />
      </ToolsGrid>

      <ScoreSubmissionCard
        formError={formError}
        isSubmitting={submitScore.isPending}
        match={match}
        myScore={myScore}
        opponentScore={opponentScore}
        opponentSubmission={opponentSubmission}
        playerSubmission={playerSubmission}
        screenshot={screenshot}
        screenshotPreview={screenshotPreview}
        onMyScoreChange={setMyScore}
        onOpponentScoreChange={setOpponentScore}
        onScreenshotChange={handleScreenshot}
        onSubmit={handleSubmit}
      />

      {match.status === "played" && isLoser ? (
        <ActionCard>
          <CardBody>
            <SectionTitle>
              <div>
                <h2>Result Confirmation</h2>
                <p>Submitted winner: {match.winnerId === match.playerOneId ? match.player.gamerTag : match.opponent.gamerTag}</p>
              </div>
            </SectionTitle>
            <p>Score: {formatFinalScore(match, playerSubmission, opponentSubmission)}</p>
            {!resultId ? <ErrorText>Result reference unavailable. Refresh and try again.</ErrorText> : null}
            <SubmitForm
              onSubmit={(event) => {
                event.preventDefault();
                if (!resultId) return;
                acceptResult.mutate(resultId);
              }}
            >
              <Button type="submit" disabled={!resultId || acceptResult.isPending}>Accept Result</Button>
            </SubmitForm>
            <SubmitForm
              onSubmit={(event) => {
                event.preventDefault();
                if (!resultId || !rejectReason.trim()) return;
                rejectResult.mutate({ resultId, reason: rejectReason.trim() });
              }}
            >
              <Field>
                <span>Rejection reason</span>
                <input value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} />
              </Field>
              <Button type="submit" variant="secondary" disabled={!resultId || !rejectReason.trim() || rejectResult.isPending}>
                Reject Result
              </Button>
            </SubmitForm>
          </CardBody>
        </ActionCard>
      ) : null}

      {match.status === "disputed" && isWinner ? (
        <ActionCard>
          <CardBody>
            <SectionTitle>
              <div>
                <h2>Dispute Evidence</h2>
                <p>Upload screenshot evidence for admin review.</p>
              </div>
            </SectionTitle>
            <UploadDropzone fileName={screenshot?.name} onChange={handleScreenshot} />
            <Field>
              <span>Note (optional)</span>
              <input value={evidenceNote} onChange={(event) => setEvidenceNote(event.target.value)} />
            </Field>
            <Button
              type="button"
              disabled={!screenshot || uploadEvidence.isPending}
              onClick={() => screenshot && uploadEvidence.mutate({ disputeId: match.id, file: screenshot, note: evidenceNote })}
            >
              Submit Evidence
            </Button>
          </CardBody>
        </ActionCard>
      ) : null}

      <PastMatchesList matches={pastMatchesQuery.data ?? []} isLoading={pastMatchesQuery.isLoading} />
    </PageStack>
  );
}

function ScoreSubmissionCard({
  formError,
  isSubmitting,
  match,
  myScore,
  opponentScore,
  opponentSubmission,
  playerSubmission,
  screenshot,
  screenshotPreview,
  onMyScoreChange,
  onOpponentScoreChange,
  onScreenshotChange,
  onSubmit
}: {
  formError?: string;
  isSubmitting: boolean;
  match: LiveMatch;
  myScore: string;
  opponentScore: string;
  opponentSubmission?: MatchScoreSubmission;
  playerSubmission?: MatchScoreSubmission;
  screenshot: File | null;
  screenshotPreview?: string;
  onMyScoreChange: (value: string) => void;
  onOpponentScoreChange: (value: string) => void;
  onScreenshotChange: (file: File | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const hasPlayerSubmission = Boolean(playerSubmission);
  const canSubmit =
    !hasPlayerSubmission &&
    match.status !== "completed" &&
    match.status !== "disputed" &&
    match.status !== "pending_admin_approval" &&
    match.status !== "played";

  return (
    <Card>
      <CardBody>
        <SectionTitle>
          <div>
            <h2>Score Submission</h2>
            <p>Winner submits score first. Loser confirms, then admin approves.</p>
          </div>
        </SectionTitle>

        {match.status === "completed" ? (
          <ResultState $tone="success">
            <CheckCircle2 size={22} />
            <div>
              <h3>Match completed</h3>
              <p>Final score: <strong>{formatFinalScore(match, playerSubmission, opponentSubmission)}</strong></p>
            </div>
          </ResultState>
        ) : null}

        {match.status === "disputed" ? (
          <ResultState $tone="danger">
            <AlertTriangle size={22} />
            <div>
              <h3>Admin review required</h3>
              <p>Your submission conflicts with the opponent submission. Further score submission is disabled while the dispute is reviewed.</p>
            </div>
          </ResultState>
        ) : null}

        {hasPlayerSubmission && match.status !== "completed" && match.status !== "disputed" ? (
          <ResultState $tone="pending">
            <Clock size={22} />
            <div>
              <h3>Waiting for opponent confirmation</h3>
              <p>Result submitted. Waiting for opponent confirmation.</p>
            </div>
          </ResultState>
        ) : null}

        {match.status === "pending_admin_approval" ? (
          <ResultState $tone="pending">
            <Clock size={22} />
            <div>
              <h3>Waiting for admin approval</h3>
              <p>Result accepted. Waiting for admin approval.</p>
            </div>
          </ResultState>
        ) : null}

        {playerSubmission ? (
          <SubmissionDetails title="Your submitted score" submission={playerSubmission} myLabel="My Score" opponentLabel="Opponent Score" />
        ) : null}

        {match.status === "disputed" && opponentSubmission ? (
          <SubmissionDetails
            title="Opponent submitted score"
            submission={opponentSubmission}
            myLabel={`${match.opponent.gamerTag} Score`}
            opponentLabel={`${match.player.gamerTag} Score`}
            showEvidence={false}
          />
        ) : null}

        {canSubmit ? (
          <SubmitForm onSubmit={onSubmit}>
            <ScoreGrid>
              <Field>
                <span>My Score</span>
                <input min={0} max={99} type="number" value={myScore} onChange={(event) => onMyScoreChange(event.target.value)} />
              </Field>
              <Field>
                <span>Opponent Score</span>
                <input min={0} max={99} type="number" value={opponentScore} onChange={(event) => onOpponentScoreChange(event.target.value)} />
              </Field>
            </ScoreGrid>
            <UploadDropzone fileName={screenshot?.name} onChange={onScreenshotChange} />
            {screenshotPreview ? <PreviewImage src={screenshotPreview} alt="Screenshot evidence preview" /> : null}
            {formError ? <ErrorText>{formError}</ErrorText> : null}
            <Button type="submit" disabled={isSubmitting}>Submit Result</Button>
          </SubmitForm>
        ) : null}
      </CardBody>
    </Card>
  );
}

function SubmissionDetails({
  myLabel,
  opponentLabel,
  showEvidence = true,
  submission,
  title
}: {
  myLabel: string;
  opponentLabel: string;
  showEvidence?: boolean;
  submission: MatchScoreSubmission;
  title: string;
}) {
  return (
    <SubmissionPanel>
      <h3>{title}</h3>
      <ScoreSummary>
        <span>{myLabel}: <strong>{submission.myScore}</strong></span>
        <span>{opponentLabel}: <strong>{submission.opponentScore}</strong></span>
      </ScoreSummary>
      {showEvidence ? (
        <EvidenceLine>
          Evidence: <strong>{getEvidenceLabel(submission.evidence)}</strong>
          {getEvidenceUrl(submission.evidence) ? <EvidenceLink href={getEvidenceUrl(submission.evidence)} target="_blank" rel="noreferrer">View screenshot</EvidenceLink> : null}
        </EvidenceLine>
      ) : null}
    </SubmissionPanel>
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

function formatFinalScore(match: LiveMatch, playerSubmission?: MatchScoreSubmission, opponentSubmission?: MatchScoreSubmission): string {
  const resolvedScore = getResolvedScore(match);
  if (resolvedScore) {
    return resolvedScore;
  }

  if (playerSubmission) {
    return `${playerSubmission.myScore}-${playerSubmission.opponentScore}`;
  }

  if (opponentSubmission) {
    return `${opponentSubmission.opponentScore}-${opponentSubmission.myScore}`;
  }

  if (match.winnerId && match.loserId) {
    return "Verified";
  }

  return "Completed";
}

function getResolvedScore(match: LiveMatch): string | undefined {
  if (typeof match.playerOneScore !== "number" || typeof match.playerTwoScore !== "number") {
    return undefined;
  }

  if (match.playerOneId === match.player.id) {
    return `${match.playerOneScore}-${match.playerTwoScore}`;
  }

  if (match.playerTwoId === match.player.id) {
    return `${match.playerTwoScore}-${match.playerOneScore}`;
  }

  return `${match.playerOneScore}-${match.playerTwoScore}`;
}

function getEvidenceLabel(evidence: MatchScoreSubmission["evidence"]): string {
  if (typeof evidence === "string") {
    return evidence.split("/").pop() ?? "Screenshot uploaded";
  }

  return evidence.fileName;
}

function getEvidenceUrl(evidence: MatchScoreSubmission["evidence"]): string | undefined {
  return typeof evidence === "string" ? evidence : evidence.previewUrl;
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

const ActionCard = styled(Card)``;

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
  margin-top: 1rem;
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
`;

const ResultState = styled.div<{ $tone: "success" | "danger" | "pending" }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.75rem;
  align-items: start;
  border: 1px solid ${({ $tone, theme }) => {
    if ($tone === "success") return "rgba(0, 200, 83, 0.42)";
    if ($tone === "danger") return "rgba(255, 59, 48, 0.5)";
    return theme.colors.borderStrong;
  }};
  border-radius: 8px;
  background: ${({ $tone, theme }) => {
    if ($tone === "success") return "rgba(0, 200, 83, 0.12)";
    if ($tone === "danger") return "rgba(255, 59, 48, 0.12)";
    return theme.colors.goldSoft;
  }};
  padding: 1rem;

  svg {
    color: ${({ $tone, theme }) => {
      if ($tone === "success") return theme.colors.success;
      if ($tone === "danger") return theme.colors.error;
      return theme.colors.gold;
    }};
  }

  h3,
  p {
    margin: 0;
  }

  h3 {
    font-size: 1rem;
  }

  p {
    margin-top: 0.25rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const SubmissionPanel = styled.div`
  display: grid;
  gap: 0.65rem;
  margin-top: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surfaceGlass};
  padding: 1rem;

  h3 {
    margin: 0;
    font-size: 1rem;
  }
`;

const ScoreSummary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem 1rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const EvidenceLine = styled.p`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const EvidenceLink = styled.a`
  color: ${({ theme }) => theme.colors.gold};
  font-weight: 800;
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
