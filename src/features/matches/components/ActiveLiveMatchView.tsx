"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Send } from "lucide-react";
import styled, { css } from "styled-components";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PageStack, SectionTitle } from "@/components/ui/PagePrimitives";
import { UploadDropzone } from "@/components/ui/UploadDropzone";
import {
  generateMockGroupCode,
  getActiveLiveMatch,
  sendMockChatMessage,
  submitMockScore,
  uploadMockDisputeScreenshot
} from "@/services/mockLiveMatchService";
import type { MockActiveLiveMatch, MockLiveMatchStatus } from "@/types/domain";

export function ActiveLiveMatchView() {
  const router = useRouter();
  const [match, setMatch] = useState<MockActiveLiveMatch | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [myScore, setMyScore] = useState("");
  const [opponentScore, setOpponentScore] = useState("");
  const [scoreError, setScoreError] = useState<string>();

  useEffect(() => {
    setMatch(getActiveLiveMatch());
  }, []);

  if (!match) {
    return (
      <EmptyWrap>
        <Card>
          <CardBody>
            <h1>No live match active.</h1>
            <p>Find and accept an opponent to start a live match.</p>
            <Button type="button" onClick={() => router.push("/find-match")}>Find Match</Button>
          </CardBody>
        </Card>
      </EmptyWrap>
    );
  }

  function refresh(next: MockActiveLiveMatch | null) {
    if (next) setMatch(next);
  }

  function sendGroupCode() {
    refresh(generateMockGroupCode());
  }

  function copyGroupCode() {
    if (match?.groupCode) {
      void navigator.clipboard?.writeText(match.groupCode);
    }
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = chatMessage.trim();
    if (!trimmed) return;

    refresh(sendMockChatMessage(trimmed));
    setChatMessage("");
  }

  function submitScoreForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (myScore === "" || opponentScore === "") {
      setScoreError("Enter both scores before submitting.");
      return;
    }

    refresh(submitMockScore(Number(myScore), Number(opponentScore)));
    setScoreError(undefined);
  }

  function uploadScreenshot(file: File | null) {
    if (!file) return;
    refresh(uploadMockDisputeScreenshot(file, URL.createObjectURL(file)));
  }

  return (
    <PageStack>
      <HeaderCard>
        <CardBody>
          <HeaderGrid>
            <div>
              <Kicker>Live Match</Kicker>
              <h1>{match.playerName} vs {match.opponent.name}</h1>
              <p>Match ID {match.id}</p>
            </div>
            <StatusPill $status={match.status}>{formatStatus(match.status)}</StatusPill>
          </HeaderGrid>
        </CardBody>
      </HeaderCard>

      <ContentGrid>
        <Card>
          <CardBody>
            <SectionTitle>
              <div>
                <h2>Group Code</h2>
                <p>Share the code when the room is ready.</p>
              </div>
            </SectionTitle>
            {match.groupCode ? (
              <GroupCodeBox>
                <strong>{match.groupCode}</strong>
                <Button type="button" variant="secondary" onClick={copyGroupCode}><Copy size={17} /> Copy</Button>
              </GroupCodeBox>
            ) : match.currentUserSide === "B" ? (
              <Button type="button" onClick={sendGroupCode}>Send Group Code</Button>
            ) : (
              <MutedText>Waiting for opponent to send group code.</MutedText>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <SectionTitle>
              <div>
                <h2>Chat</h2>
                <p>Messages are scoped to this active match.</p>
              </div>
            </SectionTitle>
            <ChatLog>
              {match.messages.map((message) => (
                <ChatBubble key={message.id} $system={message.sender === "system"}>
                  <HeaderLine>
                    <strong>{message.senderName}</strong>
                    <span>{formatTime(message.createdAt)}</span>
                  </HeaderLine>
                  <p>{message.message}</p>
                </ChatBubble>
              ))}
            </ChatLog>
            <ChatForm onSubmit={sendMessage}>
              <input value={chatMessage} onChange={(event) => setChatMessage(event.target.value)} placeholder="Type message" />
              <Button type="submit"><Send size={17} /> Send</Button>
            </ChatForm>
          </CardBody>
        </Card>
      </ContentGrid>

      <Card>
        <CardBody>
          <SectionTitle>
            <div>
              <h2>Score Submission</h2>
              <p>Submit scores first. Screenshot evidence is only needed for disputes.</p>
            </div>
          </SectionTitle>
          {match.status === "completed" ? (
            <CompletedState>
              <h3>Match completed successfully.</h3>
              <p>Final score: <strong>{match.finalScore}</strong></p>
              <p>Result: <strong>{match.result === "win" ? "Win" : "Loss"}</strong></p>
            </CompletedState>
          ) : (
            <ScoreForm onSubmit={submitScoreForm}>
              <ScoreGrid>
                <Field>
                  <span>My Score</span>
                  <input type="number" min={0} max={99} value={myScore} onChange={(event) => setMyScore(event.target.value)} />
                </Field>
                <Field>
                  <span>Opponent Score</span>
                  <input type="number" min={0} max={99} value={opponentScore} onChange={(event) => setOpponentScore(event.target.value)} />
                </Field>
              </ScoreGrid>
              {scoreError ? <ErrorText>{scoreError}</ErrorText> : null}
              <Button type="submit">Submit Score</Button>
            </ScoreForm>
          )}
        </CardBody>
      </Card>

      {match.status === "disputed" ? (
        <WarningCard>
          <CardBody>
            <h2>This match is disputed. Upload screenshot evidence for review.</h2>
            <UploadDropzone fileName={match.disputeScreenshot?.fileName} onChange={uploadScreenshot} />
            {match.disputeScreenshot?.previewUrl ? (
              <PreviewImage src={match.disputeScreenshot.previewUrl} alt="Dispute screenshot preview" />
            ) : null}
          </CardBody>
        </WarningCard>
      ) : null}
    </PageStack>
  );
}

function formatStatus(status: MockLiveMatchStatus): string {
  if (status === "in_progress") return "In Progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

const EmptyWrap = styled.div`
  min-height: calc(100vh - 9rem);
  display: grid;
  place-items: center;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
  text-align: center;

  h1 {
    margin: 0 0 0.4rem;
  }

  p {
    margin: 0 0 1rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const HeaderCard = styled(Card)`
  h1 {
    margin: 0.25rem 0;
    font-size: clamp(1.5rem, 6vw, 2.6rem);
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const HeaderGrid = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
  }
`;

const Kicker = styled.span`
  color: ${({ theme }) => theme.colors.gold};
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
`;

const StatusPill = styled.span<{ $status: MockLiveMatchStatus }>`
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
    ($status === "ready" || $status === "in_progress") &&
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

const ContentGrid = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(18rem, 0.75fr) minmax(0, 1.25fr);
  }
`;

const GroupCodeBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  strong {
    color: ${({ theme }) => theme.colors.gold};
    font-size: 1.6rem;
  }
`;

const MutedText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ChatLog = styled.div`
  display: grid;
  gap: 0.75rem;
  max-height: 18rem;
  overflow-y: auto;
  padding-right: 0.25rem;
`;

const ChatBubble = styled.div<{ $system: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.surfaceGlass};

  ${({ $system, theme }) =>
    $system &&
    css`
      border-color: ${theme.colors.borderStrong};
      background: ${theme.colors.goldSoft};
    `}

  p {
    margin: 0.25rem 0 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const HeaderLine = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;

  span {
    color: ${({ theme }) => theme.colors.textDim};
    font-size: 0.78rem;
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

const ScoreForm = styled.form`
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

const ErrorText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.error};
`;

const CompletedState = styled.div`
  border: 1px solid rgba(0, 200, 83, 0.42);
  border-radius: 8px;
  padding: 1rem;
  background: rgba(0, 200, 83, 0.12);

  h3,
  p {
    margin: 0;
  }

  p {
    margin-top: 0.4rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const WarningCard = styled(Card)`
  border-color: rgba(255, 59, 48, 0.5);

  h2 {
    margin: 0 0 1rem;
    color: ${({ theme }) => theme.colors.error};
    font-size: 1rem;
  }
`;

const PreviewImage = styled.img`
  width: min(100%, 22rem);
  max-height: 13rem;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  margin-top: 1rem;
`;
