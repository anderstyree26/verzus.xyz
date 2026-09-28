'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../lib/api';
import { useGameStore } from '../lib/gameStore';
import type { GameProfile } from '@antigravity/core';
import { OFFICIAL_GAMES, getGameById, type CatalogGame } from '../lib/gamesCatalog';
import { GamePoster } from './GamePoster';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

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

  const topGames = OFFICIAL_GAMES.slice(0, 4);

  return (
    <>
      <div className="flex items-center gap-1.5 min-w-0">
        {/* Quick Game Chips with Posters */}
        {topGames.map((game) => {
          const isActive = activeGame?.id?.toLowerCase() === game.id.toLowerCase();

          return (
            <button
              key={game.id}
              type="button"
              onClick={() => setActiveGame(game)}
              className={`relative px-2 py-1 rounded-xl text-xs font-bold transition flex items-center gap-2 select-none border min-w-0 ${
                isActive
                  ? 'bg-[#C86228] text-white border-[#C86228] shadow-sm'
                  : 'bg-[#111319] hover:bg-[#161922] text-gray-400 hover:text-white border-[#202430]'
              }`}
              title={game.displayName}
            >
              <GamePoster
                game={game}
                aspect="mini"
                className="w-4 h-6 rounded flex-shrink-0"
              />
              <span className="hidden lg:inline truncate max-w-[100px]">
                {game.displayName.replace(' (Universal)', '')}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0 animate-pulse" />
              )}
            </button>
          );
        })}

        {/* View All Modal Trigger */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-2.5 py-1.5 bg-[#111319] hover:bg-[#161922] border border-[#202430] hover:border-[#C86228] text-gray-400 hover:text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 flex-shrink-0"
          title="Browse all game arenas"
        >
          <span>🕹️</span>
          <span className="hidden sm:inline">Arenas ({OFFICIAL_GAMES.length})</span>
        </button>
      </div>

      {/* Modal: FACEIT Poster Directory */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-[#111319] border border-[#202430] rounded-2xl shadow-2xl p-6 text-white flex flex-col gap-4 max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#202430] pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold">Select Active Game Arena</h3>
                <p className="text-xs text-gray-400">
                  Switching titles updates your matchmaking, open duels, and rankings.
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 overflow-y-auto pr-1 scrollbar-thin max-h-[55vh]">
              {OFFICIAL_GAMES.map((g) => {
                const isSelected = activeGame?.id?.toLowerCase() === g.id.toLowerCase();
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setActiveGame(g);
                      setModalOpen(false);
                    }}
                    className={`relative rounded-xl overflow-hidden border text-left transition-all duration-200 group aspect-[3/4] flex flex-col justify-between p-2.5 ${
                      isSelected
                        ? 'border-[#C86228] ring-2 ring-[#C86228]/40 shadow-lg'
                        : 'border-[#202430] hover:border-gray-500'
                    }`}
                  >
                    <GamePoster
                      game={g}
                      aspect="poster"
                      showOverlay
                      className="absolute inset-0 w-full h-full"
                    />

                    <div className="relative z-10 flex items-center justify-between w-full">
                      <Badge variant="secondary" className="backdrop-blur-md bg-black/70 text-[9px] font-mono">
                        {g.platform}
                      </Badge>
                      {isSelected && (
                        <span className="px-1.5 py-0.5 rounded bg-[#C86228] text-white text-[9px] font-black">
                          ACTIVE ✓
                        </span>
                      )}
                    </div>

                    <div className="relative z-10">
                      <span className="font-bold text-xs text-white block leading-tight group-hover:text-[#D97736] transition-colors truncate">
                        {g.displayName}
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono block mt-0.5">
                        {g.gameType.replace('_', ' ')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#202430] flex items-center justify-between text-xs">
              <Link
                href="/games"
                onClick={() => setModalOpen(false)}
                className="text-[#D97736] hover:underline font-bold"
              >
                View Full Game Catalog →
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
