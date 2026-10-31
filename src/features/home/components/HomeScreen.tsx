"use client";

import { PublicShell } from "@/components/public/PublicShell";
import { CtaBannerSection } from "@/features/home/components/CtaBannerSection";
import { FeaturesSection } from "@/features/home/components/FeaturesSection";
import { HeroSection } from "@/features/home/components/HeroSection";
import { IntroHero } from "@/features/home/components/IntroHero";
import { PathToFinaleSection } from "@/features/home/components/PathToFinaleSection";
import { TournamentsTeaserSection } from "@/features/home/components/TournamentsTeaserSection";

export function HomeScreen() {
  return (
    <PublicShell>
      <IntroHero />
      <HeroSection />
      <TournamentsTeaserSection />
      <PathToFinaleSection />
      <FeaturesSection />
      <CtaBannerSection />
    </PublicShell>
  );
}
