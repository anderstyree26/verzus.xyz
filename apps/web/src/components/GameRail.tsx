'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useGameStore } from '../lib/gameStore';
import { apiClient } from '../lib/api';
import type { GameProfile } from '@antigravity/core';

// Preset default esports games if API is still loading
const PRESET_GAMES = [
  { id: 'cs2', name: 'Counter-Strike 2', short: 'CS2', icon: '🎯', color: 'from-amber-600 to-orange-700' },
  { id: 'rl', name: 'Rocket League', short: 'RL', icon: '🚗', color: 'from-blue-600 to-indigo-700' },
  { id: 'eafc', name: 'EA Sports FC 25', short: 'FC25', icon: '⚽', color: 'from-emerald-600 to-teal-800' },
  { id: 'cod', name: 'Call of Duty: Warzone', short: 'COD', icon: '🪖', color: 'from-neutral-700 to-stone-900' },
  { id: 'dota2', name: 'Dota 2', short: 'DOTA', icon: '🛡️', color: 'from-red-700 to-rose-900' },
  { id: 'subway', name: 'Subway Surfers', short: 'SUB', icon: '🛹', color: 'from-pink-600 to-purple-800' },
];

export function GameRail() {
  const pathname = usePathname();
  const { activeGame, setActiveGame, initializeDefaultGame } = useGameStore();

  const { data: games } = useQuery<GameProfile[]>({
    queryKey: ['approved-games-rail'],
    queryFn: () => apiClient<GameProfile[]>('/games'),
  });

  useEffect(() => {
    if (games && games.length > 0) {
      initializeDefaultGame(games);
    }
  }, [games, initializeDefaultGame]);

  const displayGames = (games && games.length > 0)
    ? games
    : PRESET_GAMES.map((p) => ({
        id: p.id,
        displayName: p.name,
        gameType: 'HIGH_SCORE' as const,
        platform: 'UNIVERSAL' as const,
        isOfficial: true,
      } as unknown as GameProfile));

  return (
    <aside className="w-16 sm:w-18 flex-shrink-0 bg-[#08080C] border-r border-[#161622] flex flex-col items-center py-3 z-40 select-none">
      {/* Brand Icon Mark */}
      <Link
        href="/"
        className="w-11 h-11 rounded-xl bg-[#FF5500] hover:bg-[#FF661A] flex items-center justify-center font-black text-black text-lg transition-transform hover:scale-105 shadow-[0_0_16px_rgba(255,85,0,0.4)] mb-4"
        title="VerzusXYZ Arena Home"
      >
        VX
      </Link>

      <div className="w-8 h-px bg-[#1E1E2C] mb-3" />

      {/* Vertical Games Rail */}
      <div className="flex-1 flex flex-col items-center gap-2.5 overflow-y-auto overflow-x-hidden w-full scrollbar-none px-2">
        {displayGames.map((game, idx) => {
          const isActive = activeGame?.id === game.id || (!activeGame && idx === 0);
          const name = game.displayName || (game as any).display_name || 'Game';
          const preset = PRESET_GAMES[idx % PRESET_GAMES.length];

          return (
            <div key={game.id} className="relative group w-full flex items-center justify-center">
              {/* Active Orange Edge Indicator (FACEIT signature) */}
              {isActive && (
                <span className="absolute left-0 w-1 h-7 bg-[#FF5500] rounded-r-full shadow-[0_0_8px_#FF5500]" />
              )}

              <button
                type="button"
                onClick={() => setActiveGame(game)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs transition-all relative overflow-hidden ${
                  isActive
                    ? 'bg-[#1E1E2C] border-2 border-[#FF5500] text-white shadow-lg shadow-[#FF5500]/20 scale-105'
                    : 'bg-[#12121A] border border-[#1E1E2C] hover:border-gray-500 text-gray-400 hover:text-white hover:scale-105'
                }`}
              >
                <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${preset?.color || 'from-gray-700 to-black'}`} />
                <span className="relative z-10 text-base">{preset?.icon || '🎮'}</span>
              </button>

              {/* Floating Tooltip */}
              <div className="fixed left-20 z-50 pointer-events-none hidden group-hover:flex flex-col bg-[#12121A] border border-[#262638] py-1.5 px-3 rounded-lg shadow-2xl text-left whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
                <span className="text-xs font-black text-white">{name}</span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {game.platform || 'UNIVERSAL'} · {game.gameType || 'ESPORTS'}
                </span>
              </div>
            </div>
          );
        })}

        {/* Add / Calibrate Game Profile Button */}
        <Link
          href="/games/new"
          className="w-11 h-11 rounded-xl border border-dashed border-gray-700 hover:border-[#FF5500] bg-transparent hover:bg-[#FF5500]/10 text-gray-500 hover:text-[#FF5500] flex items-center justify-center text-lg font-bold transition-all hover:scale-105"
          title="Calibrate / Register New Game"
        >
          +
        </Link>
      </div>

      <div className="w-8 h-px bg-[#1E1E2C] my-3" />

      {/* Bottom Shortcuts */}
      <div className="flex flex-col items-center gap-2">
        <Link
          href="/admin"
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition ${
            pathname.startsWith('/admin')
              ? 'bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/40'
              : 'text-gray-400 hover:text-white hover:bg-[#161622]'
          }`}
          title="Admin Control Hub"
        >
          🛡️
        </Link>
        <Link
          href="/settings"
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition ${
            pathname.startsWith('/settings')
              ? 'bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/40'
              : 'text-gray-400 hover:text-white hover:bg-[#161622]'
          }`}
          title="Account Settings"
        >
          ⚙️
        </Link>
      </div>
    </aside>
  );
}
