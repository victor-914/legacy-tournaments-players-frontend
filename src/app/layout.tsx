import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import { AppProviders } from "@/providers/AppProviders";
import { StyledComponentsRegistry } from "@/providers/StyledComponentsRegistry";
import { ogImage, siteName, siteUrl, twitterHandle } from "@/constants/seo";

const title = "Legacy Esports | Compete in Live Tournaments";
const description =
  "Join live weekly esports tournaments with transparent brackets, group-stage qualifiers, fair qualification, and real payouts.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s | ${siteName}`
  },
  description,
  applicationName: siteName,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    siteName,
    title,
    description,
    url: "/",
    locale: "en_US",
    images: [ogImage]
  },
  twitter: {
    card: "summary_large_image",
    site: twitterHandle,
    creator: twitterHandle,
    title,
    description,
    images: [ogImage]
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
