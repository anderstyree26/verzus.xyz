'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { GameProfileCard } from '../../components/GameProfileCard';
import { apiClient } from '../../lib/api';
import { useGameStore } from '../../lib/gameStore';
import { OFFICIAL_GAMES, type CatalogGame } from '../../lib/gamesCatalog';
import type { GameProfile } from '@antigravity/core';

export default function GamesPage() {
  const { setActiveGame } = useGameStore();
  const { data: games, isLoading } = useQuery<GameProfile[]>({
    queryKey: ['approved-games'],
    queryFn: () => apiClient<GameProfile[]>('/games').catch(() => []),
  });

  const officialIds = new Set(OFFICIAL_GAMES.map((g) => g.id.toLowerCase()));
  const customGames = (games || []).filter(
    (g) => !officialIds.has(g.id.toLowerCase())
  );
  const allGames = [...OFFICIAL_GAMES, ...customGames];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* VX Game Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111319] p-6 sm:p-8 border border-[#202430] rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#161922] border border-[#202430] flex items-center justify-center text-3xl font-black text-[#D97736] shadow-inner">
            🕹️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#C86228]/15 text-[#D97736] border border-[#C86228]/30 text-[10px] font-bold uppercase tracking-wider rounded">
                Official Esports Roster
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              Supported Games & Titles
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Select any game title to browse open duels, competitive ladders, and tournaments.
            </p>
          </div>
        </div>

        <Link
          href="/games/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#161922] hover:bg-[#202430] border border-[#202430] hover:border-[#C86228]/40 text-gray-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition text-center"
        >
          <span>+</span>
          <span>Calibrate Custom Game</span>
        </Link>
      </div>

      {isLoading && allGames.length === 0 ? (
        <div className="p-12 text-center text-gray-400 font-mono text-xs bg-[#111319] border border-[#202430] rounded-2xl animate-pulse">
          Loading game titles...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allGames.map((g) => {
            const catalogItem = OFFICIAL_GAMES.find((c) => c.id.toLowerCase() === g.id.toLowerCase());
            const icon = catalogItem?.icon || '🎮';
            const tagline = catalogItem?.tagline || (g as any).tagline || 'Competitive Esports Duel';
            const displayName = g.displayName || (g as any).display_name || 'Untitled Game';
            const platform = g.platform || 'UNIVERSAL';
            const platforms = (g as any).constraints?.platforms;
            const isOfficial = g.isOfficial ?? (g as any).is_official ?? false;

            return (
              <GameProfileCard
                key={g.id}
                id={g.id}
                displayName={displayName}
                platform={platform}
                platforms={platforms}
                isOfficial={isOfficial}
                icon={icon}
                tagline={tagline}
                onSelectGame={() => setActiveGame(g)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
