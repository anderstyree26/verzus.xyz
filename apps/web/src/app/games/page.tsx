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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Game Profiles</h1>
          <p className="text-sm text-gray-400">
            Browse official and community-calibrated OCR game archetypes.
          </p>
        </div>

        <Link
          href="/games/new"
          className="px-4 py-2 bg-accent hover:bg-accent-600 font-bold text-xs rounded-md transition"
        >
          Submit New Profile
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
              isOfficial={(g as any).isOfficial ?? (g as any).is_official ?? false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
