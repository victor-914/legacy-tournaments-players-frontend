import type { Metadata } from "next";
import { PlayerRoutesScreen } from "@/features/championship/components/PlayerRoutesScreen";

const title = "Championship Player Routes";
const description =
  "Season ranks for every championship qualifier and where each group finish leads in the knockout stage.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/championship/players" },
  openGraph: { title: `${title} | Legacy Esports`, description, url: "/championship/players" },
  twitter: { title: `${title} | Legacy Esports`, description }
};

export default function Page() {
  return <PlayerRoutesScreen />;
}
