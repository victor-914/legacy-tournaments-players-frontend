"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Card, CardBody } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/PagePrimitives";
import { useGroupChat, useMyFixtures } from "@/features/championship/hooks/useChampionship";
import type { MyFixture } from "@/features/championship/types";

const formatDue = (value: string | null) =>
  value
    ? new Date(value).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "No deadline";

const fixtureState = (fixture: MyFixture) => {
  if (fixture.verificationStatus === "verified") return { label: "Played", tone: "done" };
  if (fixture.status === "live" || fixture.status === "current") return { label: "Live", tone: "live" };
  if (fixture.status === "disputed" || fixture.status === "pending_admin_approval") return { label: "Under review", tone: "warn" };
  if (fixture.status === "played") return { label: "Awaiting confirmation", tone: "warn" };
  if (fixture.overdue) return { label: "Overdue", tone: "late" };
  return { label: "Scheduled", tone: "todo" };
};

// Shown on the Group Stage page when the active cycle is the championship
// (knockout) cycle: the player's admin-set fixtures and their group's chat.
// Renders nothing for regular cycles.
export function KnockoutGroupPanel() {
  const fixturesQuery = useMyFixtures();
  const data = fixturesQuery.data;
  if (!data) return null;

  const played = data.fixtures.filter((fixture) => fixture.verificationStatus === "verified").length;
  const myId = data.myPlayerId;

  return (
    <>
      <Card>
        <CardBody>
          <SectionTitle>
            <div>
              <h2>
                Championship fixtures · {played}/{data.requiredMatchesPerPlayer} played
              </h2>
              <p>
                {data.groupName}: matches are set by the admins. Open a fixture to chat with your opponent, agree a time and share the room
                code. Play before the deadline.
              </p>
            </div>
          </SectionTitle>
          {data.fixtures.length === 0 ? <Hint>Your fixtures have not been published yet.</Hint> : null}
          <Fixtures>
            {data.fixtures.map((fixture) => {
              const opponent = fixture.playerOne.playerId === myId ? fixture.playerTwo : fixture.playerOne;
              const state = fixtureState(fixture);
              const myScore = fixture.playerOne.playerId === myId ? fixture.playerOneScore : fixture.playerTwoScore;
              const theirScore = fixture.playerOne.playerId === myId ? fixture.playerTwoScore : fixture.playerOneScore;
              return (
                <li key={fixture.id} data-tone={state.tone}>
                  <span className="round">{fixture.round ? `R${fixture.round}` : "—"}</span>
                  <span className="opponent">vs {opponent.gameTag}</span>
                  <span className="due">{state.tone === "done" ? `${myScore ?? "–"} – ${theirScore ?? "–"}` : formatDue(fixture.dueAt)}</span>
                  <span className="state">{state.label}</span>
                  {state.tone === "done" ? <span /> : <Link href={`/matches/${fixture.id}`}>Open</Link>}
                </li>
              );
            })}
          </Fixtures>
        </CardBody>
      </Card>
      <GroupChatCard groupId={data.groupId} groupName={data.groupName} />
    </>
  );
}

function GroupChatCard({ groupId, groupName }: { groupId: string; groupName: string }) {
  const { query, send } = useGroupChat(groupId);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const chat = query.data;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [chat?.messages.length]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || send.isPending) return;
    send.mutate(message, { onSuccess: () => setDraft("") });
  };

  return (
    <Card>
      <CardBody>
        <SectionTitle>
          <div>
            <h2>{groupName} chat</h2>
            <p>Your group and the admins. Be respectful: admins can mute players.</p>
          </div>
        </SectionTitle>
        {query.isError ? <Hint>Group chat is unavailable right now.</Hint> : null}
        {chat?.pinned.length ? (
          <Pinned>
            {chat.pinned.map((message) => (
              <p key={message.id}>
                📌 <b>{message.senderName}</b>: {message.message}
              </p>
            ))}
          </Pinned>
        ) : null}
        <Messages ref={listRef} aria-live="polite">
          {chat?.messages.length === 0 ? <Hint>No messages yet. Say hi to your group.</Hint> : null}
          {chat?.messages.map((message) => (
            <Message key={message.id} data-role={message.senderRole} data-deleted={message.deleted}>
              <header>
                <b>{message.senderName}</b>
                <time>{new Date(message.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</time>
              </header>
              <p>{message.message}</p>
            </Message>
          ))}
        </Messages>
        {chat?.muted ? (
          <Hint>You have been muted in this chat by an admin{chat.mutedUntil ? ` until ${new Date(chat.mutedUntil).toLocaleString()}` : ""}.</Hint>
        ) : (
          <Composer onSubmit={submit}>
            <input value={draft} maxLength={500} placeholder="Message your group…" onChange={(event) => setDraft(event.target.value)} aria-label="Message your group" />
            <button type="submit" disabled={!draft.trim() || send.isPending}>
              Send
            </button>
          </Composer>
        )}
        {send.isError ? <Hint>Message not sent. Please try again.</Hint> : null}
      </CardBody>
    </Card>
  );
}

const Hint = styled.p`
  margin: 0 0 0.75rem;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Fixtures = styled.ol`
  display: grid;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: grid;
    grid-template-columns: 2.4rem minmax(0, 1.4fr) minmax(0, 1.2fr) auto auto;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 0.75rem;
    border-radius: 0.6rem;
    background: rgba(255, 255, 255, 0.03);
    font-size: 0.88rem;
  }

  @media (max-width: 640px) {
    li {
      grid-template-columns: 2.2rem minmax(0, 1fr) auto;
    }

    .due {
      grid-column: 2 / 3;
    }
  }

  .round {
    color: ${({ theme }) => theme.colors.textDim};
  }

  .opponent {
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .due {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  .state {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  li[data-tone="done"] .state {
    color: ${({ theme }) => theme.colors.success};
  }

  li[data-tone="live"] .state {
    color: ${({ theme }) => theme.colors.info};
  }

  li[data-tone="late"] .state,
  li[data-tone="warn"] .state {
    color: ${({ theme }) => theme.colors.warning};
  }

  li[data-tone="todo"] .state {
    color: ${({ theme }) => theme.colors.gold};
  }

  a {
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    color: ${({ theme }) => theme.colors.gold};
    font-size: 0.8rem;
    font-weight: 700;
  }
`;

const Pinned = styled.div`
  margin-bottom: 0.6rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.6rem;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  background: ${({ theme }) => theme.colors.goldSoft};
  font-size: 0.85rem;

  p {
    margin: 0.15rem 0;
  }
`;

const Messages = styled.div`
  display: grid;
  gap: 0.4rem;
  max-height: 22rem;
  overflow-y: auto;
  margin-bottom: 0.6rem;
`;

const Message = styled.article`
  padding: 0.45rem 0.7rem;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.04);

  &[data-role="admin"] {
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  }

  &[data-deleted="true"] {
    opacity: 0.5;
    font-style: italic;
  }

  header {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    font-size: 0.8rem;
  }

  time {
    color: ${({ theme }) => theme.colors.textDim};
  }

  p {
    margin: 0.15rem 0 0;
    font-size: 0.9rem;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

const Composer = styled.form`
  display: flex;
  gap: 0.5rem;

  input {
    flex: 1;
    min-width: 0;
    padding: 0.6rem 0.8rem;
    border-radius: 0.6rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: rgba(255, 255, 255, 0.04);
    color: ${({ theme }) => theme.colors.text};
    font-size: 1rem;
  }

  button {
    padding: 0 1.1rem;
    border-radius: 0.6rem;
    border: 0;
    background: ${({ theme }) => theme.colors.gold};
    color: #0b0b0b;
    font-weight: 700;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
