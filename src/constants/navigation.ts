import { BarChart3, Gamepad2, Home, Radio, Shield, Trophy, User } from "lucide-react";

export const playerNavigation = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Find Match", href: "/find-match", icon: Gamepad2 },
  { label: "Live Match", href: "/live-match", icon: Radio },
  { label: "Tournaments", href: "/tournaments", icon: Trophy },
  { label: "Group Stage", href: "/group-stage", icon: Shield },
  { label: "Leaderboards", href: "/leaderboards", icon: BarChart3 },
  { label: "Profile", href: "/profile", icon: User }
] as const;
