import { create } from "zustand";
import { clearStoredAccessToken, storeAccessToken } from "@/services/authService";
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
  setSession: (player, accessToken) => {
    storeAccessToken(accessToken);
    set({ player, accessToken });
  },
  clearSession: () => {
    clearStoredAccessToken();
    set({ player: null, accessToken: null });
  }
}));
