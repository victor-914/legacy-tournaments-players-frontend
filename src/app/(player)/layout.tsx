import { AuthGate } from "@/components/auth/AuthGate";
import { PlayerShell } from "@/layouts/PlayerShell";

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <PlayerShell>{children}</PlayerShell>
    </AuthGate>
  );
}
