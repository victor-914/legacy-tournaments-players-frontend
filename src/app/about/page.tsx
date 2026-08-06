import type { Metadata } from "next";
import { AboutScreen } from "@/features/about/components/AboutScreen";

export const metadata: Metadata = {
  title: "About | Legacy Esports",
  description: "The story, events, team, and vision behind Legacy Esports."
};

export default function AboutPage() {
  return <AboutScreen />;
}
