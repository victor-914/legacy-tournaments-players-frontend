import {
  ActivityItem,
  DashboardSummary,
  Match,
  MatchStatus,
  Player,
  QualificationStatus,
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
  status: MatchStatus.WaitingForSubmission
};

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
