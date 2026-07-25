import type { LucideIcon } from "lucide-react";
import { BarChart3, Gamepad2, History, Home, Radio, Shield, Trophy, User } from "lucide-react";

export interface PlayerNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Defaults to true when omitted. */
  showOnDesktop?: boolean;
  /** Defaults to true when omitted. */
  showOnMobile?: boolean;
}

export const playerNavigation: PlayerNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Find Match", href: "/find-match", icon: Gamepad2 },
  { label: "Live Match", href: "/live-match", icon: Radio },
  { label: "Tournaments", href: "/tournaments", icon: Trophy },
  { label: "Group Stage", href: "/group-stage", icon: Shield },
  { label: "My Tournaments", href: "/my-tournaments", icon: History },
  { label: "Leaderboards", href: "/leaderboards", icon: BarChart3 },
  // Profile is reachable via the Topbar icon on both breakpoints instead of the primary nav.
  { label: "Profile", href: "/profile", icon: User, showOnDesktop: false, showOnMobile: false }
];
