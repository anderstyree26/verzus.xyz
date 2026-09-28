'use client';

import { create } from 'zustand';

export interface GameAccount {
  gameId: string;
  gamertag: string;
  platformName: string;
  verified: boolean;
}

interface GameAccountsState {
  accounts: Record<string, string>; // gameId -> gamertag
  setGamertag: (gameId: string, gamertag: string) => void;
  getGamertag: (gameId: string) => string | null;
  getGamertagLabel: (gameId: string) => string;
}

const STORAGE_KEY = 'verzus_game_accounts';

const PLATFORM_LABELS: Record<string, string> = {
  cs2: 'Steam ID / Gamertag',
  eafc: 'EA ID',
  rl: 'Epic Games ID',
  val: 'Riot ID (Name#TAG)',
  cod: 'Activision ID',
  dota2: 'Steam ID / Friend Code',
  fortnite: 'Epic Games ID',
  subway: 'Gamer Handle',
};

export const useGameAccountsStore = create<GameAccountsState>((set, get) => {
  let initialAccounts: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) initialAccounts = JSON.parse(saved);
    } catch {
      initialAccounts = {};
    }
  }

  return {
    accounts: initialAccounts,

    setGamertag: (gameId: string, gamertag: string) => {
      const updated = { ...get().accounts, [gameId.toLowerCase()]: gamertag.trim() };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      set({ accounts: updated });
    },

    getGamertag: (gameId: string) => {
      if (!gameId) return null;
      return get().accounts[gameId.toLowerCase()] || null;
    },

    getGamertagLabel: (gameId: string) => {
      if (!gameId) return 'In-Game Gamertag';
      return PLATFORM_LABELS[gameId.toLowerCase()] || 'In-Game Gamertag / ID';
    },
  };
});
