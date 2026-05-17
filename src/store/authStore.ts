import { create } from "zustand";
import type { Player } from "@/types/domain";

interface AuthState {
  player: Player | null;
  accessToken: string | null;
  setSession: (player: Player, accessToken: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  player: null,
  accessToken: null,
  setSession: (player, accessToken) => set({ player, accessToken }),
  clearSession: () => set({ player: null, accessToken: null })
}));
