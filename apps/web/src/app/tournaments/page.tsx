'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { TournamentCard } from '../../components/TournamentCard';
import { apiClient } from '../../lib/api';

interface TournamentItem {
  id: string;
  name: string;
  format: string;
  size: number;
  entry_fee: number;
  prize_pool: number;
  status: string;
}

export default function TournamentsPage() {
  const { data: tournaments, isLoading } = useQuery<TournamentItem[]>({
    queryKey: ['tournaments-list'],
    queryFn: () => apiClient<TournamentItem[]>('/tournaments'),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Tournaments</h1>
          <p className="text-sm text-gray-400">Compete in single/double elimination and round-robin tournaments.</p>
        </div>

        <Link
          href="/tournaments/new"
          className="px-4 py-2 bg-accent hover:bg-accent-600 font-bold text-xs rounded-md transition"
        >
          Create Tournament
        </Link>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-400">Loading tournaments...</div>
      ) : tournaments && tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t) => (
            <TournamentCard
              key={t.id}
              id={t.id}
              name={t.name}
              format={t.format}
              size={t.size}
              entryFee={t.entry_fee}
              prizePool={t.prize_pool}
              status={t.status}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-surface-elevated border border-surface-border rounded-lg text-gray-500">
          No tournaments found. Create the first one!
        </div>
      )}
    </div>
  );
}
