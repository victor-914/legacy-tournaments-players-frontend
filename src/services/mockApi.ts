import { activity, dashboardSummary, players, standings, tournaments, upcomingMatch } from "@/constants/mockData";
import type { ActivityItem, DashboardSummary, Match, Player, Standing, Tournament } from "@/types/domain";

const latency = 250;

function resolveMock<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), latency);
  });
}

export const mockApi = {
  getDashboard(): Promise<DashboardSummary> {
    return resolveMock(dashboardSummary);
  },
  getTournaments(): Promise<Tournament[]> {
    return resolveMock(tournaments);
  },
  getTournament(id: string): Promise<Tournament> {
    return resolveMock(tournaments.find((tournament) => tournament.id === id) ?? tournaments[0]);
  },
  getStandings(): Promise<Standing[]> {
    return resolveMock(standings);
  },
  getLeaderboard(): Promise<Standing[]> {
    return resolveMock([...standings].sort((a, b) => b.xp - a.xp));
  },
  getActivity(): Promise<ActivityItem[]> {
    return resolveMock(activity);
  },
  getMatch(): Promise<Match> {
    return resolveMock(upcomingMatch);
  },
  getProfile(): Promise<Player> {
    return resolveMock(players[0]);
  }
};
