import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// 1200x630 is the ratio WhatsApp, X, Slack and iMessage all crop cleanly.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Legacy Esports — compete in live weekly tournaments";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public", "legacy_logo.jpeg"));
  const logoSrc = `data:image/jpeg;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0B0B0B",
          backgroundImage:
            "radial-gradient(circle at 12% 8%, rgba(212, 175, 55, 0.22), transparent 45%), radial-gradient(circle at 88% 92%, rgba(58, 134, 255, 0.18), transparent 45%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={96} height={96} alt="" style={{ borderRadius: "50%" }} />
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.01em" }}>Legacy Esports</div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "48px",
            fontSize: 82,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em"
          }}
        >
          Compete. Climb. Go Legacy.
        </div>

        <div style={{ display: "flex", marginTop: "28px", fontSize: 34, color: "#B5B5B5", maxWidth: "900px" }}>
          Live weekly tournaments with transparent brackets, group-stage qualifiers, and real payouts.
        </div>

        <div style={{ display: "flex", marginTop: "48px", gap: "16px" }}>
          {["Weekly Cycles", "Fair Qualification", "Live Standings"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                padding: "12px 24px",
                borderRadius: "999px",
                border: "1px solid rgba(212, 175, 55, 0.5)",
                color: "#D4AF37",
                fontSize: 26,
                fontWeight: 600
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
