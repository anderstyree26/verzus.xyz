'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';

interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  trust_score: number;
  role: string;
  region?: string;
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['public-profile', username],
    queryFn: () => apiClient<UserProfile>(`/profile/${username}`),
  });

  if (isLoading) {
    return <div className="p-12 text-center text-gray-400">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="p-12 text-center text-red-400">Player @{username} not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto my-8 p-8 bg-surface-elevated border border-surface-border rounded-xl text-white flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent/20 text-accent font-extrabold text-2xl flex items-center justify-center border border-accent/40">
          {profile.username.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
          <p className="text-xs text-gray-400">@{profile.username} · Role: {profile.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-4 bg-surface border border-surface-border rounded">
          <span className="text-gray-400 block mb-1 font-sans">Trust Score</span>
          <span className="text-xl font-bold text-accent">{profile.trust_score} / 1000</span>
        </div>

        <div className="p-4 bg-surface border border-surface-border rounded">
          <span className="text-gray-400 block mb-1 font-sans">Region</span>
          <span className="text-xl font-bold text-white">{profile.region || 'GLOBAL'}</span>
        </div>
      </div>
    </div>
  );
}
