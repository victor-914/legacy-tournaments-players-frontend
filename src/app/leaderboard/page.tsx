import type { Metadata } from "next";
import { pageMetadata } from "@/constants/seo";
import { PublicLeaderboardScreen } from "@/features/public-leaderboard/components/PublicLeaderboardScreen";

const title = "Public Leaderboard";
const description =
  "Live, public season and group leaderboards for Legacy Esports tournaments — updated in real time.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/leaderboard" });

export default function PublicLeaderboardPage() {
  return <PublicLeaderboardScreen />;
}
