'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import type { GameProfile } from '@antigravity/core';

export default function AdminProfilesPage() {
  const { data: profiles, refetch } = useQuery<GameProfile[]>({
    queryKey: ['all-game-profiles'],
    queryFn: () => apiClient<GameProfile[]>('/games'),
  });

  const handleApprove = async (id: string) => {
    try {
      await apiClient(`/games/${id}/approve`, { method: 'POST' });
      alert('Profile approved!');
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Approval failed: ${msg}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Approve Game Profiles</h1>
          <p className="text-sm text-gray-400">Review game archetypes and calibrations submitted by the community.</p>
        </div>

        <Link
          href="/games/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-600 font-bold text-xs rounded-md text-white transition shadow-sm"
        >
          <span>⚡</span>
          <span>Auto-Calibrate New Game</span>
        </Link>
      </div>

      <div className="divide-y divide-surface-border bg-surface-elevated border border-surface-border rounded-lg">
        {profiles?.map((p) => (
          <div key={p.id} className="p-4 flex justify-between items-center text-sm">
            <div>
              <span className="font-bold text-white">{p.displayName}</span>
              <p className="text-xs text-gray-400">Platform: {p.platform} · Type: {p.gameType}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {p.approved ? 'APPROVED' : 'PENDING'}
              </span>

              {!p.approved && (
                <button
                  onClick={() => handleApprove(p.id)}
                  className="px-3 py-1 bg-accent hover:bg-accent-600 text-xs font-bold rounded transition"
                >
                  Approve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
