import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import { AppProviders } from "@/providers/AppProviders";
import { StyledComponentsRegistry } from "@/providers/StyledComponentsRegistry";

// Link previews (WhatsApp, X, Slack, iMessage) need absolute URLs, so every
// relative image/URL below is resolved against this. Set NEXT_PUBLIC_SITE_URL
// to the deployed origin — a wrong value here means broken preview images.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const title = "Legacy Esports | Compete in Live Tournaments";
const description =
  "Join live weekly esports tournaments with transparent brackets, group-stage qualifiers, fair qualification, and real payouts.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | Legacy Esports"
  },
  description,
  applicationName: "Legacy Esports",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    siteName: "Legacy Esports",
    title,
    description,
    url: "/",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    site: "@legacygaming_ng",
    creator: "@legacygaming_ng",
    title,
    description
  },
  icons: {
    icon: "/legacy_logo.jpeg",
    apple: "/legacy_logo.jpeg"
  }
};

// Inter was named in the theme but never actually loaded, so the site was
// falling back to Segoe UI/Arial. Anton is the display face for hero headlines.
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-body" });
const anton = Anton({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-display" });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable}`}>
      <body>
        <StyledComponentsRegistry>
          <AppProviders>{children}</AppProviders>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
