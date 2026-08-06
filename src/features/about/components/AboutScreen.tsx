"use client";

import { PublicShell } from "@/components/public/PublicShell";
import { AboutHero } from "@/features/about/components/AboutHero";
import { GallerySection } from "@/features/about/components/GallerySection";
import { StorySection } from "@/features/about/components/StorySection";
import { TeamSection } from "@/features/about/components/TeamSection";
import { VisionSection } from "@/features/about/components/VisionSection";

export function AboutScreen() {
  return (
    <PublicShell>
      <AboutHero />
      <StorySection />
      <GallerySection />
      <TeamSection />
      <VisionSection />
    </PublicShell>
  );
}
