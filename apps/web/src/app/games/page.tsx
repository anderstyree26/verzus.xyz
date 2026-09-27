'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { GameProfileCard } from '../../components/GameProfileCard';
import { apiClient } from '../../lib/api';
import type { GameProfile } from '@antigravity/core';

export default function GamesPage() {
  const { data: games, isLoading } = useQuery<GameProfile[]>({
    queryKey: ['approved-games'],
    queryFn: () => apiClient<GameProfile[]>('/games'),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* VX Game Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111319] p-6 border border-[#202430] rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#161922] border border-[#202430] flex items-center justify-center text-2xl font-black text-[#D97736]">
            🕹️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#C86228]/15 text-[#D97736] border border-[#C86228]/30 text-[10px] font-bold uppercase tracking-wider rounded">
                Universal Game Catalog
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-0.5">
              Esports Titles & Profiles
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Official and community-calibrated OCR game archetypes across PC, Console, and Mobile.
            </p>
          </div>
        </div>

        <Link
          href="/games/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C86228] hover:bg-[#D97736] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#C86228]/20"
        >
          <span>+</span>
          <span>Calibrate New Title</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-400">Loading games...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games?.map((g) => (
            <GameProfileCard
              key={g.id}
              id={g.id}
              displayName={(g as any).displayName || (g as any).display_name || 'Untitled Game'}
              gameType={(g as any).gameType || (g as any).game_type || 'CUSTOM'}
              platform={(g as any).platform || 'MOBILE'}
              platforms={(g as any).constraints?.platforms}
              isOfficial={(g as any).isOfficial ?? (g as any).is_official ?? false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
