import type { Metadata } from "next";
import { PublicLeaderboardScreen } from "@/features/public-leaderboard/components/PublicLeaderboardScreen";

const title = "Public Leaderboard";
const description =
  "Live, public season and group leaderboards for Legacy Esports tournaments — updated in real time.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/leaderboard" },
  openGraph: { title: `${title} | Legacy Esports`, description, url: "/leaderboard" },
  twitter: { title: `${title} | Legacy Esports`, description }
};

export default function PublicLeaderboardPage() {
  return <PublicLeaderboardScreen />;
}
