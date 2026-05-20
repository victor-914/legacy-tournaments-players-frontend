import {
  ActivityItem,
  DashboardSummary,
  FindMatch,
  GroupStageMatch,
  LiveMatch,
  Match,
  MatchMessage,
  PastMatch,
  PlayerGroupStage,
  Player,
  QualificationStatus,
  SubmissionMatchStatus,
  Standing,
  Tournament,
  TournamentStatus
} from "@/types/domain";
import { minutesFromNow } from "@/utils/format";

export const players: Player[] = [
  {
    id: "player-1",
    gamerTag: "VOLT_Hammer",
    avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=volt",
    rank: "Diamond II",
    xp: 18420,
    level: 42,
    winRate: 71,
    streak: 6,
    qualificationStatus: QualificationStatus.NearQualification
  },
  {
    id: "player-2",
    gamerTag: "AstraFang",
    avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=astra",
    rank: "Elite I",
    xp: 22100,
    level: 48,
    winRate: 78,
    streak: 9,
    qualificationStatus: QualificationStatus.Qualified
  },
  {
    id: "player-3",
    gamerTag: "RiftNova",
    avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=rift",
    rank: "Diamond I",
    xp: 17680,
    level: 40,
    winRate: 67,
    streak: 3,
    qualificationStatus: QualificationStatus.InGroupStage
  },
  {
    id: "player-4",
    gamerTag: "KairoClutch",
    avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=kairo",
    rank: "Platinum III",
    xp: 15320,
    level: 36,
    winRate: 59,
    streak: 1,
    qualificationStatus: QualificationStatus.AtRisk
  }
];

// TODO: Replace this temporary group-stage fallback with the real player group-stage API response.
const groupStagePlayers: Player[] = [
  ...players,
  {
    id: "player-5",
    gamerTag: "NyxPulse",
    avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=nyx",
    rank: "Diamond III",
    xp: 14920,
    level: 34,
    winRate: 55,
    streak: 2,
    qualificationStatus: QualificationStatus.InGroupStage
  },
  {
    id: "player-6",
    gamerTag: "BladeMint",
    avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=blade",
    rank: "Elite II",
    xp: 19140,
    level: 43,
    winRate: 64,
    streak: 4,
    qualificationStatus: QualificationStatus.InGroupStage
  },
  {
    id: "player-7",
    gamerTag: "QuasarJet",
    avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=quasar",
    rank: "Diamond II",
    xp: 18210,
    level: 41,
    winRate: 63,
    streak: 1,
    qualificationStatus: QualificationStatus.InGroupStage
  },
  {
    id: "player-8",
    gamerTag: "EchoLance",
    avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=echo",
    rank: "Platinum I",
    xp: 13780,
    level: 31,
    winRate: 51,
    streak: 0,
    qualificationStatus: QualificationStatus.InGroupStage
  },
  {
    id: "player-9",
    gamerTag: "ZenithRush",
    avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=zenith",
    rank: "Diamond I",
    xp: 16990,
    level: 39,
    winRate: 60,
    streak: 2,
    qualificationStatus: QualificationStatus.InGroupStage
  },
  {
    id: "player-10",
    gamerTag: "MakoVex",
    avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=mako",
    rank: "Platinum II",
    xp: 12840,
    level: 29,
    winRate: 48,
    streak: 0,
    qualificationStatus: QualificationStatus.InGroupStage
  }
];

export const standings: Standing[] = players.map((player, index) => ({
  rank: index + 1,
  player,
  wins: [8, 7, 6, 4][index],
  losses: [1, 2, 3, 5][index],
  xp: player.xp,
  points: [24, 21, 18, 12][index],
  qualificationStatus: player.qualificationStatus,
  movement: ["same", "up", "down", "same"][index] as Standing["movement"]
}));

export const groupStageMatches: GroupStageMatch[] = [
  { id: "group-match-1", opponent: groupStagePlayers[1], status: "played", result: "win", playerScore: 3, opponentScore: 1 },
  { id: "group-match-2", opponent: groupStagePlayers[2], status: "played", result: "loss", playerScore: 1, opponentScore: 2 },
  { id: "group-match-3", opponent: groupStagePlayers[3], status: "current", result: "not_played", scheduledAt: minutesFromNow(34) },
  { id: "group-match-4", opponent: groupStagePlayers[4], status: "pending", result: "not_played", scheduledAt: minutesFromNow(118) },
  { id: "group-match-5", opponent: groupStagePlayers[5], status: "pending", result: "not_played", scheduledAt: minutesFromNow(190) },
  { id: "group-match-6", opponent: groupStagePlayers[6], status: "pending", result: "not_played" },
  { id: "group-match-7", opponent: groupStagePlayers[7], status: "pending", result: "not_played" },
  { id: "group-match-8", opponent: groupStagePlayers[8], status: "pending", result: "not_played" },
  { id: "group-match-9", opponent: groupStagePlayers[9], status: "pending", result: "not_played" }
];

export const groupStageStandings: Standing[] = groupStagePlayers
  .map((player, index) => ({
    rank: index + 1,
    player,
    wins: [2, 2, 1, 1, 1, 1, 0, 0, 0, 0][index],
    losses: [1, 0, 1, 1, 1, 0, 1, 1, 0, 0][index],
    xp: player.xp,
    points: [6, 6, 3, 3, 3, 3, 0, 0, 0, 0][index],
    qualificationStatus: player.qualificationStatus,
    movement: ["same", "up", "down", "same", "same", "up", "down", "same", "same", "same"][index] as Standing["movement"]
  }))
  .sort((a, b) => b.points - a.points || b.wins - a.wins)
  .map((standing, index) => ({ ...standing, rank: index + 1 }));

export const playerGroupStage: PlayerGroupStage = {
  isAdded: true,
  player: players[0],
  groupName: "Group A",
  season: "Season 1",
  cycle: "Cycle 7",
  totalPlayers: groupStagePlayers.length,
  currentMatch: groupStageMatches.find((match) => match.status === "current"),
  matches: groupStageMatches,
  standings: groupStageStandings
};

export const activity: ActivityItem[] = [
  { id: "a1", type: "qualification", message: "VOLT_Hammer moved within 180 XP of qualification", createdAt: "2m ago" },
  { id: "a2", type: "match", message: "AstraFang confirmed a 3-1 result in Group A", createdAt: "7m ago" },
  { id: "a3", type: "standing", message: "RiftNova climbed to rank 3 after match verification", createdAt: "12m ago" },
  { id: "a4", type: "dispute", message: "One score mismatch was sent to review", createdAt: "18m ago" }
];

export const upcomingMatch: Match = {
  id: "hg-match-1042",
  opponent: players[1],
  tournamentName: "Hammer Weekly Cycle 7",
  groupName: "Group A",
  scheduledAt: minutesFromNow(34),
  status: SubmissionMatchStatus.WaitingForSubmission
};

export const findMatches: FindMatch[] = [
  {
    id: "hg-match-1042",
    opponent: players[1],
    season: "Season 1",
    cycle: "Cycle 7",
    groupName: "Group A",
    status: "pending",
    scheduledAt: minutesFromNow(34)
  },
  {
    id: "hg-match-1043",
    opponent: players[2],
    season: "Season 1",
    cycle: "Cycle 7",
    groupName: "Group A",
    status: "live"
  }
];

// TODO: Replace these temporary live-match fallbacks with persisted backend match sessions.
export const liveMatches: LiveMatch[] = findMatches.map((match) => ({
  id: match.id,
  player: players[0],
  opponent: match.opponent,
  season: match.season,
  cycle: match.cycle,
  groupName: match.groupName,
  status: match.status,
  scheduledAt: match.scheduledAt,
  submissions: []
}));

// TODO: Replace placeholder match chat history with WebSocket-backed messages scoped by matchId.
export const matchMessages: MatchMessage[] = [
  {
    id: "msg-1",
    matchId: "hg-match-1042",
    senderId: players[0].id,
    senderName: players[0].gamerTag,
    message: "Ready when you are.",
    createdAt: new Date(Date.now() - 6 * 60_000).toISOString()
  }
];

export const pastMatches: PastMatch[] = [
  {
    id: "past-1",
    opponent: players[3],
    score: "3-1",
    result: "win",
    status: "completed",
    date: new Date(Date.now() - 24 * 60 * 60_000).toISOString()
  },
  {
    id: "past-2",
    opponent: players[2],
    score: "1-2",
    result: "loss",
    status: "completed",
    date: new Date(Date.now() - 2 * 24 * 60 * 60_000).toISOString()
  }
];

export const tournaments: Tournament[] = [
  {
    id: "weekly-cycle-7",
    name: "Hammer Weekly Cycle 7",
    type: "Weekly Group Stage",
    status: TournamentStatus.Live,
    participants: 128,
    qualificationSlots: 32,
    progress: 68,
    currentCycle: "Cycle 7",
    groupStage: "Active"
  },
  {
    id: "group-stage-alpha",
    name: "Group Stage Alpha",
    type: "Group Qualifier",
    status: TournamentStatus.WeeklyGroupStage,
    participants: 64,
    qualificationSlots: 16,
    progress: 52,
    currentCycle: "Cycle 7",
    groupStage: "TOP 2 QUALIFY"
  },
  {
    id: "season-one-finale",
    name: "Season One Grand Finale",
    type: "Championship",
    status: TournamentStatus.GrandFinale,
    participants: 24,
    qualificationSlots: 1,
    progress: 18,
    currentCycle: "Season 1",
    groupStage: "Invites locking"
  },
  {
    id: "cycle-6-archive",
    name: "Hammer Weekly Cycle 6",
    type: "Weekly Group Stage",
    status: TournamentStatus.Completed,
    participants: 128,
    qualificationSlots: 32,
    progress: 100,
    currentCycle: "Cycle 6",
    groupStage: "Completed"
  }
];

export const dashboardSummary: DashboardSummary = {
  player: players[0],
  season: "Season 1",
  cycle: "Cycle 7",
  qualificationProgress: 84,
  weeklyRank: 7,
  currentGroup: "Group A",
  upcomingMatch,
  recentResults: ["W 3-1", "W 2-0", "L 1-2", "W 4-2"],
  standings,
  activity
};
