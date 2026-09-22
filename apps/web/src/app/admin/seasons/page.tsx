'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';

interface Season {
  id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminSeasonsPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [startsAt, setStartsAt] = useState(new Date().toISOString().slice(0, 16));
  const [endsAt, setEndsAt] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  );

  const { data: seasons, isLoading } = useQuery<Season[]>({
    queryKey: ['admin-seasons'],
    queryFn: () => apiClient<Season[]>('/seasons'),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiClient('/seasons', {
        method: 'POST',
        body: JSON.stringify({
          name,
          startsAt: new Date(startsAt).toISOString(),
          endsAt: new Date(endsAt).toISOString(),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-seasons'] });
      setIsCreating(false);
      setName('');
    },
  });

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link href="/admin" className="hover:text-white transition">Admin</Link>
            <span>/</span>
            <span className="text-gray-200">Seasons</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Seasons & Resets</h1>
          <p className="text-xs text-gray-400">Manage competitive seasons, ladder soft-resets, and rewards.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent hover:bg-accent/80 text-white transition"
        >
          + Create New Season
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="p-5 bg-surface-elevated border border-surface-border rounded-xl space-y-4"
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">New Season Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Season Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Season 1: Reckoning"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-border text-white text-xs px-3 py-2 rounded border border-surface-border focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full bg-surface-border text-white text-xs px-3 py-2 rounded border border-surface-border focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                required
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full bg-surface-border text-white text-xs px-3 py-2 rounded border border-surface-border focus:border-accent outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded text-xs text-gray-400 hover:text-white bg-surface-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !name}
              className="px-4 py-1.5 rounded text-xs font-semibold bg-accent hover:bg-accent/80 text-white transition disabled:opacity-50"
            >
              {createMutation.isPending ? 'Starting...' : 'Launch Season'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-sm text-gray-500 py-8 text-center">Loading seasons...</div>
      ) : !seasons || seasons.length === 0 ? (
        <div className="text-sm text-gray-500 py-8 text-center bg-surface-elevated border border-surface-border rounded-lg">
          No seasons found.
        </div>
      ) : (
        <div className="space-y-3">
          {seasons.map((s) => (
            <div
              key={s.id}
              className="p-5 bg-surface-elevated border border-surface-border rounded-xl flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">{s.name}</h3>
                  {s.is_active && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-accent/20 text-accent border border-accent/40">
                      LIVE SEASON
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(s.starts_at).toLocaleDateString()} — {new Date(s.ends_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right text-xs text-gray-500 font-mono">
                ID: {s.id.substring(0, 8)}...
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
