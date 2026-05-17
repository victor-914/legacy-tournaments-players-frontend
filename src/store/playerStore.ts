import { create } from "zustand";
import type { Player } from "@/types/domain";

interface PlayerState {
  activePlayer: Player | null;
  setActivePlayer: (player: Player) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  activePlayer: null,
  setActivePlayer: (player) => set({ activePlayer: player })
}));
