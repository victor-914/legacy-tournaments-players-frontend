import { LiveMatchView } from "@/features/matches/components/LiveMatchView";

export default async function LiveMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <LiveMatchView matchId={id} />;
}
