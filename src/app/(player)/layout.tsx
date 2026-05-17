import { PlayerShell } from "@/layouts/PlayerShell";

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return <PlayerShell>{children}</PlayerShell>;
}
