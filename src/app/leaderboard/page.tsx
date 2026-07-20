import type { Metadata } from "next";
import { PublicLeaderboardScreen } from "@/features/public-leaderboard/components/PublicLeaderboardScreen";

export const metadata: Metadata = {
  title: "Public Leaderboard | Legacy Gaming",
  description: "Live, public season and group leaderboards for Legacy Gaming esports tournaments — updated in real time."
};

export default function PublicLeaderboardPage() {
  return <PublicLeaderboardScreen />;
}
