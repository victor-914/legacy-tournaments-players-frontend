import type { Metadata } from "next";

// Link previews (WhatsApp, X, Slack, iMessage) need absolute URLs, so every
// relative image/URL is resolved against this via metadataBase. Hardcoded on
// purpose: an env override (e.g. localhost) leaked into shared previews.
export const siteUrl = "https://legacygamingafrica.com";

export const siteName = "Legacy Esports";
export const twitterHandle = "@legacygaming_ng";

// A single static file rather than a generated og-image route: WhatsApp's
// crawler gives up on slow responses, and a file out of /public is served
// immediately. It is 1200x630 (the ratio every scraper crops to) and kept
// under ~300KB as a JPEG, because WhatsApp silently drops previews above that.
export const ogImage = {
  url: "/images/banner-og.jpg",
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "Legacy Esports — compete in live weekly tournaments"
};

/**
 * Metadata for a sub-page. Next.js does NOT deep-merge `openGraph`/`twitter`
 * with the root layout — a page that sets either replaces the whole object,
 * dropping the preview image. Always build page metadata through this helper
 * so shared links (WhatsApp etc.) keep the image, card type and site name.
 */
export function pageMetadata({
  title,
  description,
  path
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const fullTitle = `${title} | ${siteName}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName,
      locale: "en_US",
      title: fullTitle,
      description,
      url: path,
      images: [ogImage]
    },
    twitter: {
      card: "summary_large_image",
      site: twitterHandle,
      creator: twitterHandle,
      title: fullTitle,
      description,
      images: [ogImage]
    }
  };
}
