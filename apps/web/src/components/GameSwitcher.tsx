'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../lib/api';
import { useGameStore } from '../lib/gameStore';
import type { GameProfile } from '@antigravity/core';

import { OFFICIAL_GAMES, getGameById, type CatalogGame } from '../lib/gamesCatalog';

export function GameSwitcher() {
  const [modalOpen, setModalOpen] = useState(false);
  const { activeGame, setActiveGame, initializeDefaultGame } = useGameStore();

  const { data: games } = useQuery<GameProfile[]>({
    queryKey: ['approved-games-switcher'],
    queryFn: () => apiClient<GameProfile[]>('/games'),
  });

  useEffect(() => {
    if (games && games.length > 0) {
      initializeDefaultGame(games);
    }
  }, [games, initializeDefaultGame]);

  const officialIds = new Set(OFFICIAL_GAMES.map((g) => g.id.toLowerCase()));
  const customGames = (games || []).filter(
    (g) => !officialIds.has(g.id.toLowerCase())
  );
  const allGames: (CatalogGame | GameProfile)[] = [...OFFICIAL_GAMES, ...customGames];
  const topGames = allGames.slice(0, 4);

  return (
    <>
      <div className="flex items-center gap-1.5">
        {/* Quick Game Chips */}
        {topGames.map((game) => {
          const isActive = activeGame?.id?.toLowerCase() === game.id.toLowerCase();
          const catalogItem = OFFICIAL_GAMES.find((c) => c.id.toLowerCase() === game.id.toLowerCase());
          const icon = catalogItem?.icon || '🎮';

          return (
            <button
              key={game.id}
              type="button"
              onClick={() => setActiveGame(game)}
              className={`relative px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 select-none ${
                isActive
                  ? 'bg-[#C86228] text-white shadow-sm'
                  : 'bg-surface hover:bg-surface-elevated text-gray-400 hover:text-white border border-surface-border'
              }`}
              title={game.displayName}
            >
              <span className="text-xs select-none">
                {icon}
              </span>
              <span className="hidden lg:inline truncate max-w-[120px]">
                {game.displayName.replace(' (Universal)', '')}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          );
        })}

        {/* View All / Add Game Trigger */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-2 py-1.5 bg-surface hover:bg-surface-elevated border border-dashed border-gray-600 hover:border-[#C86228] text-gray-400 hover:text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
          title="Browse all games"
        >
          <span>🎮</span>
          <span className="hidden sm:inline">Games ({allGames.length})</span>
        </button>
      </div>

      {/* Modal: Game Directory */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#111319] border border-surface-border rounded-2xl shadow-2xl p-6 text-white flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div>
                <h3 className="text-lg font-bold">Select Active Game</h3>
                <p className="text-xs text-gray-400">
                  Switching titles updates your matchmaking, duels, and rankings.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {allGames.map((g) => {
                const isSelected = activeGame?.id?.toLowerCase() === g.id.toLowerCase();
                const catalogItem = OFFICIAL_GAMES.find((c) => c.id.toLowerCase() === g.id.toLowerCase());
                const icon = catalogItem?.icon || '🎮';
                const tagline = catalogItem?.tagline || 'Competitive Esports Duel';

                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setActiveGame(g);
                      setModalOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-[#C86228]/15 border-[#C86228] text-white shadow'
                        : 'bg-surface border-surface-border hover:border-gray-500 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{g.displayName}</span>
                          {g.isOfficial && (
                            <span className="px-1.5 py-0.5 bg-[#C86228]/20 text-[#D97736] text-[9px] font-bold rounded">
                              OFFICIAL
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {g.platform} · {tagline}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="text-[#D97736] font-extrabold text-sm">ACTIVE ✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xs">
              <Link
                href="/games/new"
                onClick={() => setModalOpen(false)}
                className="text-[#D97736] hover:underline font-bold flex items-center gap-1"
              >
                <span>⚡ Calibrate New Game Profile →</span>
              </Link>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-surface-elevated hover:bg-surface border border-surface-border rounded-lg text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
