export type DrawStatus = "draft" | "roster_locked" | "drawing" | "complete" | "published";
export type RevealStage = "class" | "rank" | "stats" | "name" | "group";

export const REVEAL_STAGES: RevealStage[] = ["class", "rank", "stats", "name", "group"];

export interface DrawPick {
  order: number;
  userId?: string;
  gameTag?: string;
  seasonRank?: number;
  pot?: string;
  drawClass: string;
  points?: number;
  wins?: number;
  scoreDifference?: number;
  matchesPlayed?: number;
  sourceCycleNumber?: number;
  sourceGroupRank?: number;
  achievements?: string[];
  group?: string;
}

export interface DrawCurrent extends DrawPick {
  stage: RevealStage;
  stageStartedAt: string;
  paused: boolean;
}

export interface ChampionshipRosterRow {
  userId: string;
  gameTag: string;
  seasonRank: number;
  pot: string;
  drawClass: string;
  points: number;
  wins: number;
  scoreDifference: number;
  matchesPlayed: number;
  sourceCycleNumber: number;
}

export interface ChampionshipPreset {
  groups: number;
  playersPerGroup: number;
  pots: number;
  requiredMatchesPerPlayer: number;
  autoQualifiersPerGroup: number;
  wildcardPosition: number;
  wildcardCount: number;
  bracketSize: number;
}

export interface ChampionshipState {
  cycleId: string;
  cycleName: string;
  seasonId: string;
  status: DrawStatus;
  preset: ChampionshipPreset;
  wildcardCriteria: string[];
  total: number;
  drawnCount: number;
  revealedCount: number;
  seed: string | null;
  current: DrawCurrent | null;
  groups: Record<string, DrawPick[]>;
  spaces: Record<string, Record<string, number>>;
  remainingByPot: Record<string, number>;
  recent: DrawPick[];
  groupIds: Record<string, string>;
  roster: ChampionshipRosterRow[];
  auditLog: Array<{ action: string; at: string; details?: string }>;
  startedAt: string | null;
  completedAt: string | null;
  publishedAt: string | null;
}

export interface BracketSlot {
  round: string;
  match: number;
  side: number;
  originLabel: string;
  originGroup: string | null;
  originPosition: number | null;
  isWildcard: boolean;
  wildcardIndex: number | null;
  entrant: { userId: string; gameTag: string; provisional: boolean } | null;
}

export interface ChampionshipBracket {
  cycleId: string;
  ready: boolean;
  final: boolean;
  slots: BracketSlot[];
}

export interface MyFixture {
  id: string;
  round: number | null;
  dueAt: string | null;
  overdue: boolean;
  status: string;
  verificationStatus: string;
  playerOne: { playerId: string; userId: string; gameTag: string };
  playerTwo: { playerId: string; userId: string; gameTag: string };
  playerOneScore: number | null;
  playerTwoScore: number | null;
  winnerPlayerId: string | null;
}

export interface MyFixturesData {
  groupId: string;
  groupName: string;
  cycleId: string;
  requiredMatchesPerPlayer: number;
  myPlayerId: string;
  fixtures: MyFixture[];
}

export interface GroupChatMessage {
  id: string;
  groupId: string;
  senderId: string | null;
  senderName: string;
  senderRole: "player" | "admin" | "system" | string;
  message: string;
  pinned: boolean;
  deleted: boolean;
  createdAt: string;
}

export interface GroupChatData {
  groupId: string;
  groupName: string;
  muted: boolean;
  mutedUntil: string | null;
  pinned: GroupChatMessage[];
  messages: GroupChatMessage[];
}

export const CLASS_TIERS: Record<string, string> = {
  S: "Top seed",
  A: "Pot A",
  B: "Pot B",
  C: "Pot C"
};

export const WILDCARD_CRITERIA_LABELS: Record<string, string> = {
  points: "Points",
  wins: "Wins",
  scoreDifference: "Score difference",
  scoreFor: "Score for",
  fewerMatchesPlayed: "Fewer matches played"
};
