'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';
import { getGameById, OFFICIAL_GAMES, type CatalogGame } from '../../../lib/gamesCatalog';
import { useGameStore } from '../../../lib/gameStore';
import type { GameProfile } from '@antigravity/core';

export default function GameProfileDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { setActiveGame } = useGameStore();

  const { data: profile, isLoading } = useQuery<GameProfile | null>({
    queryKey: ['game-profile-detail', id],
    queryFn: () => apiClient<GameProfile>(`/games/${id}`).catch(() => null),
  });

  const catalogFallback = getGameById(id);
  const resolvedProfile = profile || catalogFallback;
  const catalogItem = OFFICIAL_GAMES.find((c) => c.id.toLowerCase() === resolvedProfile.id.toLowerCase());
  const icon = catalogItem?.icon || '🎮';
  const tagline = catalogItem?.tagline || 'Competitive OCR Matchmaking';

  if (isLoading && !profile && !catalogItem) {
    return <div className="p-12 text-center text-gray-400 font-mono text-xs">Loading HUD specification...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 sm:p-8 bg-[#111319] border border-[#202430] rounded-2xl text-white flex flex-col gap-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202430] pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#161922] border border-[#202430] flex items-center justify-center text-3xl shadow-inner">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#D97736] font-bold uppercase tracking-wider">
                {resolvedProfile.platform || 'UNIVERSAL'} · {tagline}
              </span>
              {resolvedProfile.isOfficial && (
                <span className="px-1.5 py-0.2 bg-[#C86228]/20 text-[#D97736] text-[9px] font-bold rounded">
                  OFFICIAL
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1 text-white">
              {resolvedProfile.displayName || (resolvedProfile as any).display_name || 'Game Profile'}
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Title Code: {resolvedProfile.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/matches/new?profileId=${resolvedProfile.id}`}
            onClick={() => setActiveGame(resolvedProfile)}
            className="px-5 py-2.5 bg-[#C86228] hover:bg-[#D97736] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-[#C86228]/20"
          >
            ⚔️ Play Duel
          </Link>
          <Link
            href={`/leaderboards/${resolvedProfile.id}`}
            onClick={() => setActiveGame(resolvedProfile)}
            className="px-4 py-2.5 bg-[#161922] hover:bg-[#202430] border border-[#202430] text-gray-300 hover:text-white font-bold text-xs uppercase rounded-xl transition"
          >
            🥇 Ladder
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-4 bg-[#0B0C10] border border-[#202430] rounded-xl">
          <span className="text-gray-400 block mb-1 font-sans font-bold uppercase text-[10px]">
            OCR Scoreboard Target ROI
          </span>
          <p className="text-white">X: {((resolvedProfile.roi?.x ?? 0.4) * 100).toFixed(1)}%, Y: {((resolvedProfile.roi?.y ?? 0.05) * 100).toFixed(1)}%</p>
          <p className="text-white">W: {((resolvedProfile.roi?.w ?? 0.2) * 100).toFixed(1)}%, H: {((resolvedProfile.roi?.h ?? 0.08) * 100).toFixed(1)}%</p>
        </div>

        <div className="p-4 bg-[#0B0C10] border border-[#202430] rounded-xl">
          <span className="text-gray-400 block mb-1 font-sans font-bold uppercase text-[10px]">
            Match End Detection Keywords
          </span>
          <p className="font-sans text-gray-200">
            {resolvedProfile.endKeywords?.join(', ') || 'VICTORY, DEFEAT, MATCH COMPLETED'}
          </p>
        </div>
      </div>

      {resolvedProfile.regexPattern && (
        <div className="p-4 bg-[#0B0C10] border border-[#202430] rounded-xl text-xs font-mono">
          <span className="text-gray-400 block mb-1 font-sans font-bold uppercase text-[10px]">
            Pattern Matcher
          </span>
          <code className="text-[#D97736] font-mono">{resolvedProfile.regexPattern}</code>
        </div>
      )}
    </div>
  );
}
