import type { Metadata } from "next";
import { AppProviders } from "@/providers/AppProviders";
import { StyledComponentsRegistry } from "@/providers/StyledComponentsRegistry";

export const metadata: Metadata = {
  title: "Legacy Esports",
  description: "Competitive player dashboard for Legacy Esports tournaments"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <AppProviders>{children}</AppProviders>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
