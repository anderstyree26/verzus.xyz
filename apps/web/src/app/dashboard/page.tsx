'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { WalletCard } from '../../components/WalletCard';
import { apiClient } from '../../lib/api';

interface MatchItem {
  id: string;
  format: string;
  status: string;
  entry_fee: number;
  prize_pool: number;
  created_at: string;
}

export default function DashboardPage() {
  const { data: matches, isLoading } = useQuery<MatchItem[]>({
    queryKey: ['my-matches'],
    queryFn: () => apiClient<MatchItem[]>('/matches/mine'),
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Player Dashboard</h1>
          <p className="text-sm text-gray-400">Manage your wallet ledger, active matches, and tournaments.</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/matches/new"
            className="px-4 py-2 bg-accent hover:bg-accent-600 font-bold text-xs rounded-md transition"
          >
            Create Match
          </Link>
          <Link
            href="/challenges"
            className="px-4 py-2 bg-surface-elevated hover:bg-surface-border border border-surface-border font-bold text-xs rounded-md transition"
          >
            Find Match
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <WalletCard />
        </div>

        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="p-6 bg-surface-elevated border border-surface-border rounded-lg">
            <h3 className="font-bold text-lg mb-4">My Recent Matches</h3>

            {isLoading ? (
              <p className="text-sm text-gray-400">Loading matches...</p>
            ) : matches && matches.length > 0 ? (
              <div className="divide-y divide-surface-border">
                {matches.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-white">Match #{m.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-400 font-mono">Format: {m.format} · Prize: {m.prize_pool} PTS</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 bg-accent/20 text-accent font-bold text-xs rounded-full uppercase">
                        {m.status}
                      </span>
                      <Link
                        href={`/matches/${m.id}`}
                        className="px-3 py-1 bg-surface hover:bg-surface-border border border-surface-border text-xs rounded font-semibold transition"
                      >
                        Open
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">No match history found. Create your first match!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
