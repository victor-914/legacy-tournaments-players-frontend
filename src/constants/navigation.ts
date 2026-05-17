import { BarChart3, Gamepad2, Home, Medal, Settings, Shield, Trophy, User } from "lucide-react";

export const playerNavigation = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Find Match", href: "/find-match", icon: Gamepad2 },
  { label: "Tournaments", href: "/tournaments", icon: Trophy },
  { label: "Group Stage", href: "/group-stage", icon: Shield },
  { label: "Leaderboards", href: "/leaderboards", icon: BarChart3 },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Live Match", href: "/matches/hg-match-1042", icon: Medal }
] as const;
