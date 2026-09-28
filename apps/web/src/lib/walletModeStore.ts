'use client';

import { create } from 'zustand';

export type WalletMode = 'REAL' | 'DEMO';

interface WalletModeState {
  mode: WalletMode;
  setMode: (mode: WalletMode) => void;
  toggleMode: () => void;
}

const STORAGE_KEY = 'verzus_wallet_mode';

export const useWalletModeStore = create<WalletModeState>((set) => {
  // Read initial from localStorage if available
  let initialMode: WalletMode = 'REAL';
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY) as WalletMode;
    if (saved === 'REAL' || saved === 'DEMO') {
      initialMode = saved;
    }
  }

  return {
    mode: initialMode,
    setMode: (mode: WalletMode) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, mode);
      }
      set({ mode });
    },
    toggleMode: () => {
      set((state) => {
        const nextMode: WalletMode = state.mode === 'REAL' ? 'DEMO' : 'REAL';
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, nextMode);
        }
        return { mode: nextMode };
      });
    },
  };
});
