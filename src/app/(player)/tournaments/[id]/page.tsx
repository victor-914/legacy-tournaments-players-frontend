import { TournamentDetailsView } from "@/features/tournaments/components/TournamentDetailsView";

export default async function TournamentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TournamentDetailsView tournamentId={id} />;
}
