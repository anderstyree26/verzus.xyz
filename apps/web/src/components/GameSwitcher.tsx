'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../lib/api';
import { useGameStore } from '../lib/gameStore';
import type { GameProfile } from '@antigravity/core';

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

  const topGames = (games || []).slice(0, 4);

  return (
    <>
      <div className="flex items-center gap-1.5">
        {/* Quick Game Chips */}
        {topGames.map((game) => {
          const isActive = activeGame?.id === game.id;
          const initial = (game.displayName || 'G').charAt(0).toUpperCase();

          return (
            <button
              key={game.id}
              type="button"
              onClick={() => setActiveGame(game)}
              className={`relative px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 select-none ${
                isActive
                  ? 'bg-[#FF5500] text-white shadow-[0_0_12px_rgba(255,85,0,0.5)]'
                  : 'bg-surface hover:bg-surface-elevated text-gray-400 hover:text-white border border-surface-border'
              }`}
              title={`${game.displayName} (${game.gameType})`}
            >
              <span className="w-4 h-4 rounded bg-black/40 flex items-center justify-center text-[10px] font-mono">
                {initial}
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
          className="px-2 py-1.5 bg-surface hover:bg-surface-elevated border border-dashed border-gray-600 hover:border-[#FF5500] text-gray-400 hover:text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
          title="Browse all games or calibrate new"
        >
          <span>🎮</span>
          <span className="hidden sm:inline">Games ({games?.length || 0})</span>
        </button>
      </div>

      {/* Modal: Game Directory */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#12121A] border border-surface-border rounded-2xl shadow-2xl p-6 text-white flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div>
                <h3 className="text-lg font-bold">Select Active Game Context</h3>
                <p className="text-xs text-gray-400">
                  Switching games adapts matchmaking, tournaments, and leaderboards.
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
              {games?.map((g) => {
                const isSelected = activeGame?.id === g.id;
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
                        ? 'bg-[#FF5500]/15 border-[#FF5500] text-white shadow'
                        : 'bg-surface border-surface-border hover:border-gray-500 text-gray-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{g.displayName}</span>
                        {g.isOfficial && (
                          <span className="px-1.5 py-0.5 bg-[#FF5500]/20 text-[#FF5500] text-[9px] font-bold rounded">
                            OFFICIAL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">
                        Engine: {g.gameType} · Platform: {g.platform}
                      </p>
                    </div>

                    {isSelected && (
                      <span className="text-[#FF5500] font-extrabold text-sm">ACTIVE ✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xs">
              <Link
                href="/games/new"
                onClick={() => setModalOpen(false)}
                className="text-[#FF5500] hover:underline font-bold flex items-center gap-1"
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
