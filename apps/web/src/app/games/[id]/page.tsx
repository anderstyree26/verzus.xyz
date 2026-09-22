'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';
import type { GameProfile } from '@antigravity/core';

export default function GameProfileDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: profile, isLoading } = useQuery<GameProfile>({
    queryKey: ['game-profile-detail', id],
    queryFn: () => apiClient<GameProfile>(`/games/${id}`),
  });

  if (isLoading) {
    return <div className="p-12 text-center text-gray-400">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="p-12 text-center text-red-400">Game profile not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto my-8 p-8 bg-surface-elevated border border-surface-border rounded-xl text-white flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs text-accent font-bold uppercase">{profile.platform} · {profile.gameType}</span>
          <h1 className="text-3xl font-extrabold mt-1">{profile.displayName}</h1>
          <p className="text-xs text-gray-400 mt-1">Profile ID: {profile.id}</p>
        </div>

        <Link
          href={`/matches/new?profileId=${profile.id}`}
          className="px-5 py-2.5 bg-accent hover:bg-accent-600 font-bold text-xs rounded-md transition"
        >
          Launch Match
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-surface border border-surface-border rounded">
          <span className="text-gray-400 block mb-1">OCR Calibration Box (ROI)</span>
          <p className="font-mono">X: {(profile.roi.x * 100).toFixed(1)}%, Y: {(profile.roi.y * 100).toFixed(1)}%</p>
          <p className="font-mono">W: {(profile.roi.w * 100).toFixed(1)}%, H: {(profile.roi.h * 100).toFixed(1)}%</p>
        </div>

        <div className="p-4 bg-surface border border-surface-border rounded">
          <span className="text-gray-400 block mb-1">End Screen Keywords</span>
          <p className="font-medium text-white">{profile.endKeywords.join(', ') || 'None specified'}</p>
        </div>
      </div>

      {profile.regexPattern && (
        <div className="p-4 bg-surface border border-surface-border rounded text-xs">
          <span className="text-gray-400 block mb-1">Custom Extraction Regex</span>
          <code className="text-accent font-mono">{profile.regexPattern}</code>
        </div>
      )}
    </div>
  );
}
