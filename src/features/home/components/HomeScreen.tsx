"use client";

import { PublicShell } from "@/components/public/PublicShell";
import { CtaBannerSection } from "@/features/home/components/CtaBannerSection";
import { FeaturesSection } from "@/features/home/components/FeaturesSection";
import { HeroSection } from "@/features/home/components/HeroSection";
import { TournamentsTeaserSection } from "@/features/home/components/TournamentsTeaserSection";

export function HomeScreen() {
  return (
    <PublicShell>
      <HeroSection />
      <TournamentsTeaserSection />
      <FeaturesSection />
      <CtaBannerSection />
    </PublicShell>
  );
}
