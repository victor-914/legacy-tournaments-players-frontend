import type { Metadata } from "next";
import { RulesScreen } from "@/features/championship/components/RulesScreen";

const title = "Championship Rules";
const description =
  "Format, seeding, wildcard rules and the public audit log for the Legacy Esports championship draw.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/championship/rules" },
  openGraph: { title: `${title} | Legacy Esports`, description, url: "/championship/rules" },
  twitter: { title: `${title} | Legacy Esports`, description }
};

export default function Page() {
  return <RulesScreen />;
}
