'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useGameStore } from '../lib/gameStore';
import { apiClient } from '../lib/api';
import type { GameProfile } from '@antigravity/core';

import { OFFICIAL_GAMES, getGameById, type CatalogGame } from '../lib/gamesCatalog';

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

  // Combine official catalog games with any custom user-calibrated games
  const officialIds = new Set(OFFICIAL_GAMES.map((g) => g.id.toLowerCase()));
  const customGames = (games || []).filter(
    (g) => !officialIds.has(g.id.toLowerCase())
  );
  const displayGames: (CatalogGame | GameProfile)[] = [...OFFICIAL_GAMES, ...customGames];

  return (
    <aside className="hidden lg:flex w-16 flex-shrink-0 bg-[#0B0C10] border-r border-[#202430] flex-col items-center py-3 z-40 select-none">
      {/* Brand Icon Mark */}
      <Link
        href="/"
        className="w-10 h-10 rounded-xl bg-[#C86228] hover:bg-[#D97736] flex items-center justify-center font-black text-white text-base transition-transform hover:scale-105 shadow-sm mb-4"
        title="VerzusXYZ Arena Home"
      >
        VX
      </Link>

      <div className="w-8 h-px bg-[#202430] mb-3" />

      {/* Vertical Games Rail */}
      <div className="flex-1 flex flex-col items-center gap-2.5 overflow-y-auto overflow-x-hidden w-full scrollbar-none px-2">
        {displayGames.map((game, idx) => {
          const isActive = activeGame?.id?.toLowerCase() === game.id.toLowerCase() || (!activeGame && idx === 0);
          const name = game.displayName || (game as any).display_name || 'Game';
          const catalogItem = OFFICIAL_GAMES.find((c) => c.id.toLowerCase() === game.id.toLowerCase());
          const icon = catalogItem?.icon || '🎮';
          const tagline = catalogItem?.tagline || `${game.platform || 'UNIVERSAL'} Esports`;

          return (
            <div key={game.id} className="relative group w-full flex items-center justify-center">
              {/* Active Edge Indicator */}
              {isActive && (
                <span className="absolute left-0 w-1 h-7 bg-[#C86228] rounded-r-full shadow-sm" />
              )}

              <button
                type="button"
                onClick={() => setActiveGame(game)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all relative overflow-hidden ${
                  isActive
                    ? 'bg-[#161922] border-2 border-[#C86228] text-white shadow-sm scale-105'
                    : 'bg-[#111319] border border-[#202430] hover:border-gray-500 text-gray-400 hover:text-white hover:scale-105'
                }`}
                title={name}
              >
                <span className="text-base select-none">{icon}</span>
              </button>

              {/* Floating Tooltip */}
              <div className="fixed left-20 z-50 pointer-events-none hidden group-hover:flex flex-col bg-[#161922] border border-[#262B3A] py-1.5 px-3 rounded-lg shadow-2xl text-left whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
                <span className="text-xs font-bold text-white">{name}</span>
                <span className="text-[10px] text-gray-400">
                  {tagline}
                </span>
              </div>
            </div>
          );
        })}

        {/* Add / Calibrate Game Profile Button */}
        <Link
          href="/games/new"
          className="w-10 h-10 rounded-xl border border-dashed border-gray-700 hover:border-[#C86228] bg-transparent hover:bg-[#C86228]/10 text-gray-500 hover:text-[#C86228] flex items-center justify-center text-base font-bold transition-all hover:scale-105"
          title="Calibrate / Register New Game"
        >
          +
        </Link>
      </div>

      <div className="w-8 h-px bg-[#202430] my-3" />

      {/* Bottom Shortcuts */}
      <div className="flex flex-col items-center gap-2">
        <Link
          href="/admin"
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs transition ${
            pathname.startsWith('/admin')
              ? 'bg-[#C86228]/20 text-[#D97736] border border-[#C86228]/40'
              : 'text-gray-400 hover:text-white hover:bg-[#161922]'
          }`}
          title="Admin Control Hub"
        >
          🛡️
        </Link>
        <Link
          href="/settings"
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs transition ${
            pathname.startsWith('/settings')
              ? 'bg-[#C86228]/20 text-[#D97736] border border-[#C86228]/40'
              : 'text-gray-400 hover:text-white hover:bg-[#161922]'
          }`}
          title="Account Settings"
        >
          ⚙️
        </Link>
      </div>
    </aside>
  );
}
