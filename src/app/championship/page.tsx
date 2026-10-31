import type { Metadata } from "next";
import { ChampionshipScreen } from "@/features/championship/components/ChampionshipScreen";

const title = "Championship Live Draw";
const description =
  "Watch the Legacy Esports championship draw live: 90 qualifiers seeded into three pots and drawn into six groups, then live group standings.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/championship" },
  openGraph: { title: `${title} | Legacy Esports`, description, url: "/championship" },
  twitter: { title: `${title} | Legacy Esports`, description }
};

export default function Page() {
  return <ChampionshipScreen />;
}
