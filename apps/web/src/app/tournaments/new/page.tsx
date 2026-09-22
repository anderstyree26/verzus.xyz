'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import type { GameProfile, TournamentFormat } from '@antigravity/core';

export default function NewTournamentPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [profileId, setProfileId] = useState('');
  const [format, setFormat] = useState<TournamentFormat>('SINGLE_ELIM');
  const [size, setSize] = useState(8);
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
      const t = await apiClient<{ id: string }>('/tournaments', {
        method: 'POST',
        body: JSON.stringify({
          name,
          profileId,
          format,
          size: Number(size),
        }),
      });

      router.push(`/tournaments/${t.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 p-8 bg-surface-elevated border border-surface-border rounded-xl text-white">
      <h1 className="text-2xl font-bold">Create Tournament</h1>
      <p className="text-xs text-gray-400 mt-1">Configure elimination bracket, entrants cap, and game rules.</p>

      {error && (
        <div className="mt-4 p-3 bg-red-950/60 border border-red-800 rounded text-xs text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="mt-6 flex flex-col gap-5">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Tournament Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Genesis Weekly Cup #1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Game Profile</label>
          <select
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
          >
            <option value="">Select a game profile...</option>
            {profiles?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName} ({p.platform} - {p.gameType})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as TournamentFormat)}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
            >
              <option value="SINGLE_ELIM">Single Elimination</option>
              <option value="DOUBLE_ELIM">Double Elimination</option>
              <option value="ROUND_ROBIN">Round Robin</option>
              <option value="SWISS">Swiss System</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Entrants Cap</label>
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
            >
              <option value={4}>4 Players</option>
              <option value={8}>8 Players</option>
              <option value={16}>16 Players</option>
              <option value={32}>32 Players</option>
              <option value={64}>64 Players</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-2.5 bg-accent hover:bg-accent-600 font-bold text-sm rounded-md transition disabled:opacity-50"
        >
          {loading ? 'Publishing...' : 'Publish Tournament'}
        </button>
      </form>
    </div>
  );
}
