'use client';

import { create } from 'zustand';
import type { GameProfile } from '@antigravity/core';

interface GameState {
  activeGame: GameProfile | null;
  activeGameId: string | null;
  setActiveGame: (game: GameProfile) => void;
  setActiveGameById: (id: string, allGames: GameProfile[]) => void;
  initializeDefaultGame: (allGames: GameProfile[]) => void;
}

const STORAGE_KEY = 'verzus_active_game_id';

export const useGameStore = create<GameState>((set, get) => ({
  activeGame: null,
  activeGameId: null,

  setActiveGame: (game: GameProfile) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, game.id);
      } catch {
        // Ignore storage exceptions
      }
    }
    set({ activeGame: game, activeGameId: game.id });
  },

  setActiveGameById: (id: string, allGames: GameProfile[]) => {
    const found = allGames.find((g) => g.id === id);
    if (found) {
      get().setActiveGame(found);
    }
  },

  initializeDefaultGame: (allGames: GameProfile[]) => {
    if (!allGames || allGames.length === 0) return;

    let savedId: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        savedId = localStorage.getItem(STORAGE_KEY);
      } catch {
        // Ignore storage exceptions
      }
    }

    if (savedId) {
      const match = allGames.find((g) => g.id === savedId);
      if (match) {
        set({ activeGame: match, activeGameId: match.id });
        return;
      }
    }

    // Default to the first official game or the first available game
    const defaultGame = allGames.find((g) => g.isOfficial) || allGames[0];
    if (defaultGame) {
      set({ activeGame: defaultGame, activeGameId: defaultGame.id });
    }
  },
}));
