import type { Metadata } from "next";
import { HomeScreen } from "@/features/home/components/HomeScreen";

export const metadata: Metadata = {
  title: "Legacy Esports | Compete in Live Tournaments",
  description: "Join live weekly esports tournaments with transparent brackets, fair qualification, and real payouts."
};

export default function HomePage() {
  return <HomeScreen />;
}
