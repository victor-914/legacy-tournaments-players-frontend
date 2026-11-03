import type { Metadata } from "next";
import { pageMetadata } from "@/constants/seo";
import { ChampionshipScreen } from "@/features/championship/components/ChampionshipScreen";

const title = "Championship Live Draw";
const description =
  "Watch the Legacy Esports championship draw live: 90 qualifiers seeded into three pots and drawn into six groups, then live group standings.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/championship" });

export default function Page() {
  return <ChampionshipScreen />;
}
