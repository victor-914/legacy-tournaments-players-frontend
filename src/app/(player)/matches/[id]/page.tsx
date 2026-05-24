import { LiveMatchView } from "@/features/matches/components/LiveMatchView";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <LiveMatchView matchId={id} />;
}
