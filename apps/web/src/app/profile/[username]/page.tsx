'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';
import { EloBadge } from '../../../components/EloBadge';
import { useGameStore } from '../../../lib/gameStore';

interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  trust_score: number;
  role: string;
  region?: string;
  rating?: number;
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { activeGame } = useGameStore();

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['public-profile', username],
    queryFn: () => apiClient<UserProfile>(`/profile/${username}`),
  });

  if (isLoading) {
    return <div className="p-12 text-center text-gray-400 font-mono text-xs animate-pulse">Loading player profile...</div>;
  }

  if (!profile) {
    return (
      <div className="p-12 text-center text-gray-400 bg-[#111319] border border-[#202430] rounded-2xl max-w-lg mx-auto">
        <span className="text-3xl block mb-2">👤</span>
        <h2 className="text-lg font-bold text-white">Player @{username} not found</h2>
        <p className="text-xs text-gray-500 mt-1">This competitor tag does not exist or has been modified.</p>
        <Link href="/" className="inline-block mt-4 text-xs font-bold text-[#D97736] hover:underline">
          ← Back to Arena
        </Link>
      </div>
    );
  }

  const elo = profile.rating ?? 1000;

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 sm:p-8 bg-[#111319] border border-[#202430] rounded-2xl text-white flex flex-col gap-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202430] pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-800 to-[#C86228] text-white font-black text-2xl flex items-center justify-center shadow-md">
            {profile.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#C86228]/15 text-[#D97736] text-[10px] font-bold uppercase rounded border border-[#C86228]/30">
                {profile.role}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {profile.region || 'GLOBAL'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1 text-white">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">@{profile.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <EloBadge elo={elo} size="md" showLabel />
          <Link
            href={activeGame ? `/matches/new?profileId=${activeGame.id}&opponent=${profile.id}` : '/matches/new'}
            className="px-5 py-2.5 bg-[#C86228] hover:bg-[#D97736] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-[#C86228]/20"
          >
            ⚔️ Challenge
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-4 bg-[#0B0C10] border border-[#202430] rounded-xl">
          <span className="text-gray-400 block mb-1 font-sans font-bold uppercase text-[10px]">Competitive Elo</span>
          <span className="text-xl font-black text-white">{elo}</span>
        </div>

        <div className="p-4 bg-[#0B0C10] border border-[#202430] rounded-xl">
          <span className="text-gray-400 block mb-1 font-sans font-bold uppercase text-[10px]">FairPlay Trust</span>
          <span className="text-xl font-black text-green-400">{profile.trust_score} / 1000</span>
        </div>

        <div className="p-4 bg-[#0B0C10] border border-[#202430] rounded-xl col-span-2 sm:col-span-1">
          <span className="text-gray-400 block mb-1 font-sans font-bold uppercase text-[10px]">Home Region</span>
          <span className="text-xl font-black text-[#D97736]">{profile.region || 'GLOBAL'}</span>
        </div>
      </div>
    </div>
  );
}
