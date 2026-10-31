import type { Metadata } from "next";
import { BracketScreen } from "@/features/championship/components/BracketScreen";

const title = "Championship Bracket";
const description =
  "The Round of 64 slot map for the Legacy Esports championship, from group finishes to the final.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/championship/bracket" },
  openGraph: { title: `${title} | Legacy Esports`, description, url: "/championship/bracket" },
  twitter: { title: `${title} | Legacy Esports`, description }
};

export default function Page() {
  return <BracketScreen />;
}
