import type { Metadata } from "next";
import { pageMetadata } from "@/constants/seo";
import { RulesScreen } from "@/features/championship/components/RulesScreen";

const title = "Championship Rules";
const description =
  "Format, seeding, wildcard rules and the public audit log for the Legacy Esports championship draw.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/championship/rules" });

export default function Page() {
  return <RulesScreen />;
}
