import type {
  MockActiveLiveMatch,
  MockDisputeScreenshot,
  MockLiveMatchMessage,
  MockOpponent,
  MockScoreSubmission
} from "@/types/domain";

const ACTIVE_MATCH_KEY = "legacy.activeLiveMatch";

const opponents: MockOpponent[] = [
  {
    id: "mock-opponent-1",
    name: "AstraFang",
    rank: "Elite I",
    level: 48,
    winRate: 78
  },
  {
    id: "mock-opponent-2",
    name: "RiftNova",
    rank: "Diamond I",
    level: 40,
    winRate: 67
  }
];

function readMatch(): MockActiveLiveMatch | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(ACTIVE_MATCH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as MockActiveLiveMatch;
  } catch {
    window.localStorage.removeItem(ACTIVE_MATCH_KEY);
    return null;
  }
}

function writeMatch(match: MockActiveLiveMatch): MockActiveLiveMatch {
  window.localStorage.setItem(ACTIVE_MATCH_KEY, JSON.stringify(match));
  return match;
}

function createMessage(sender: MockLiveMatchMessage["sender"], senderName: string, message: string): MockLiveMatchMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sender,
    senderName,
    message,
    createdAt: new Date().toISOString()
  };
}

export function mockFindOpponents(): Promise<MockOpponent[]> {
  return Promise.resolve(opponents);
}

export function acceptMockMatch(opponent: MockOpponent): MockActiveLiveMatch {
  const match: MockActiveLiveMatch = {
    id: `LEG-${Math.floor(10000 + Math.random() * 90000)}`,
    playerName: "VOLT_Hammer",
    opponent,
    currentUserSide: "B",
    status: "ready",
    messages: [
      createMessage("opponent", opponent.name, "Ready?"),
      createMessage("player", "VOLT_Hammer", "Yes, send code.")
    ],
    createdAt: new Date().toISOString()
  };

  return writeMatch(match);
}

export function getActiveLiveMatch(): MockActiveLiveMatch | null {
  return readMatch();
}

export function sendMockChatMessage(message: string): MockActiveLiveMatch | null {
  const match = readMatch();
  if (!match) return null;

  return writeMatch({
    ...match,
    messages: [...match.messages, createMessage("player", match.playerName, message)]
  });
}

export function generateMockGroupCode(): MockActiveLiveMatch | null {
  const match = readMatch();
  if (!match) return null;

  const groupCode = match.groupCode ?? `LEG-${Math.floor(10000 + Math.random() * 90000)}`;

  return writeMatch({
    ...match,
    groupCode,
    status: match.status === "ready" ? "in_progress" : match.status,
    messages: [...match.messages, createMessage("player", match.playerName, `Group code: ${groupCode}`)]
  });
}

export function submitMockScore(myScore: number, opponentScore: number): MockActiveLiveMatch | null {
  const match = readMatch();
  if (!match) return null;

  const scoreSubmission: MockScoreSubmission = {
    myScore,
    opponentScore,
    submittedAt: new Date().toISOString()
  };
  const shouldDispute = opponentScore === 0 || Math.abs(myScore - opponentScore) <= 1;
  const opponentSubmission: MockScoreSubmission = shouldDispute
    ? { myScore: opponentScore + 1, opponentScore: myScore, submittedAt: new Date().toISOString() }
    : { myScore: opponentScore, opponentScore: myScore, submittedAt: new Date().toISOString() };
  const submissionsMatch =
    scoreSubmission.myScore === opponentSubmission.opponentScore &&
    scoreSubmission.opponentScore === opponentSubmission.myScore;

  return writeMatch({
    ...match,
    scoreSubmission,
    opponentSubmission,
    status: submissionsMatch ? "completed" : "disputed",
    finalScore: submissionsMatch ? `${myScore}-${opponentScore}` : undefined,
    result: submissionsMatch ? (myScore > opponentScore ? "win" : "loss") : undefined
  });
}

export function uploadMockDisputeScreenshot(file: File, previewUrl?: string): MockActiveLiveMatch | null {
  const match = readMatch();
  if (!match) return null;

  const disputeScreenshot: MockDisputeScreenshot = {
    fileName: file.name,
    previewUrl,
    uploadedAt: new Date().toISOString()
  };

  return writeMatch({ ...match, disputeScreenshot });
}
