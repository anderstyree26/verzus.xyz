'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import type { GameProfile, MatchFormat } from '@antigravity/core';

function NewMatchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultProfileId = searchParams.get('profileId') || '';

  const [profileId, setProfileId] = useState(defaultProfileId);
  const [format, setFormat] = useState<MatchFormat>('BO1');
  const [opponentId, setOpponentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: profiles } = useQuery<GameProfile[]>({
    queryKey: ['approved-profiles'],
    queryFn: () => apiClient<GameProfile[]>('/games'),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) {
      setError('Please select a game profile');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const match = await apiClient<{ id: string }>('/matches', {
        method: 'POST',
        body: JSON.stringify({
          profileId,
          opponentId: opponentId ? opponentId.trim() : null,
          format,
        }),
      });

      router.push(`/matches/${match.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 p-8 bg-surface-elevated border border-surface-border rounded-xl text-white">
      <h1 className="text-2xl font-bold">Create New Match</h1>
      <p className="text-xs text-gray-400 mt-1">Set up a 1v1 challenge or generate a private room code.</p>

      {error && (
        <div className="mt-4 p-3 bg-red-950/60 border border-red-800 rounded text-xs text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="mt-6 flex flex-col gap-5">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Game Profile</label>
          <select
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
          >
            <option value="">Select a game archetype...</option>
            {profiles?.map((p) => {
              const dName = p.displayName || (p as any).display_name || 'Game';
              const gType = p.gameType || (p as any).game_type || 'CUSTOM';
              return (
                <option key={p.id} value={p.id}>
                  {dName} ({p.platform || 'UNIVERSAL'} — {gType})
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Match Format</label>
          <div className="grid grid-cols-3 gap-3">
            {(['BO1', 'BO3', 'BO5'] as MatchFormat[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`py-2 text-xs font-bold rounded-md border transition ${
                  format === f
                    ? 'bg-accent border-accent text-white'
                    : 'bg-surface border-surface-border text-gray-400 hover:text-white'
                }`}
              >
                Best of {f.replace('BO', '')}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            {format === 'BO1' && '⚡ Single sudden-death game. First to finish/win takes the match.'}
            {format === 'BO3' && '⚔️ Best of 3 games. First player to secure 2 game wins claims victory.'}
            {format === 'BO5' && '🏆 Championship format. First player to secure 3 game wins claims victory.'}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Opponent User ID <span className="text-gray-500 font-normal">(Optional: Leave empty for open challenge)</span>
          </label>
          <input
            type="text"
            placeholder="UUID of friend or leave blank"
            value={opponentId}
            onChange={(e) => setOpponentId(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-2.5 bg-accent hover:bg-accent-600 font-bold text-sm rounded-md transition disabled:opacity-50"
        >
          {loading ? 'Creating Match...' : 'Launch Match Lobby'}
        </button>
      </form>
    </div>
  );
}

export default function NewMatchPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500 text-sm">Loading match creator...</div>}>
      <NewMatchForm />
    </Suspense>
  );
}
