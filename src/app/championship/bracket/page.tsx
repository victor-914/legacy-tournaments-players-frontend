import type { Metadata } from "next";
import { pageMetadata } from "@/constants/seo";
import { BracketScreen } from "@/features/championship/components/BracketScreen";

const title = "Championship Bracket";
const description =
  "The Round of 64 slot map for the Legacy Esports championship, from group finishes to the final.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/championship/bracket" });

export default function Page() {
  return <BracketScreen />;
}
