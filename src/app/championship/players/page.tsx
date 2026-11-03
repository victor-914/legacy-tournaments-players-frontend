import type { Metadata } from "next";
import { pageMetadata } from "@/constants/seo";
import { PlayerRoutesScreen } from "@/features/championship/components/PlayerRoutesScreen";

const title = "Championship Player Routes";
const description =
  "Season ranks for every championship qualifier and where each group finish leads in the knockout stage.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/championship/players" });

export default function Page() {
  return <PlayerRoutesScreen />;
}
