'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';

interface TournamentDetails {
  id: string;
  name: string;
  description?: string;
  format: string;
  size: number;
  entry_fee: number;
  prize_pool: number;
  status: string;
  starts_at?: string;
  game_profiles?: { display_name: string; platform: string; game_type: string };
  tournament_entries?: Array<{ user_id: string; seed?: number; checked_in: boolean }>;
}

export default function TournamentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: tournament, refetch } = useQuery<TournamentDetails>({
    queryKey: ['tournament', id],
    queryFn: () => apiClient<TournamentDetails>(`/tournaments/${id}`),
  });

  const handleJoin = async () => {
    try {
      await apiClient(`/tournaments/${id}/join`, { method: 'POST' });
      alert('Joined tournament!');
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Could not join: ${msg}`);
    }
  };

  const handleCheckin = async () => {
    try {
      await apiClient(`/tournaments/${id}/checkin`, { method: 'POST' });
      alert('Checked in successfully!');
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Check-in failed: ${msg}`);
    }
  };

  if (!tournament) {
    return <div className="p-12 text-center text-gray-400">Loading tournament...</div>;
  }

  const entrantsCount = tournament.tournament_entries?.length ?? 0;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="p-6 bg-surface-elevated border border-surface-border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs text-accent font-bold uppercase tracking-wider">
            {tournament.game_profiles?.display_name} · {tournament.format}
          </span>
          <h1 className="text-3xl font-extrabold mt-1">{tournament.name}</h1>
          <p className="text-xs text-gray-400 mt-1">
            Status: <b className="text-white uppercase">{tournament.status}</b> · Entrants: {entrantsCount}/{tournament.size}
          </p>
        </div>

        <div className="flex gap-2">
          {tournament.status === 'REGISTRATION' && (
            <button
              onClick={handleJoin}
              className="px-5 py-2.5 bg-accent hover:bg-accent-600 font-bold text-xs rounded-md transition"
            >
              Join Tournament
            </button>
          )}

          {tournament.status === 'CHECKIN' && (
            <button
              onClick={handleCheckin}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 font-bold text-xs rounded-md transition"
            >
              Check In
            </button>
          )}

          <Link
            href={`/tournaments/${id}/bracket`}
            className="px-5 py-2.5 bg-surface hover:bg-surface-border border border-surface-border font-bold text-xs rounded-md transition"
          >
            View Bracket
          </Link>
        </div>
      </div>

      {/* Prize Pool breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-surface-elevated border border-surface-border rounded-lg text-center">
          <span className="text-xs text-gray-400 uppercase">Prize Pool</span>
          <div className="text-2xl font-bold font-mono text-accent mt-1">{tournament.prize_pool} PTS</div>
        </div>
        <div className="p-4 bg-surface-elevated border border-surface-border rounded-lg text-center">
          <span className="text-xs text-gray-400 uppercase">1st Place</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {Math.floor(tournament.prize_pool * 0.5)} PTS
          </div>
        </div>
        <div className="p-4 bg-surface-elevated border border-surface-border rounded-lg text-center">
          <span className="text-xs text-gray-400 uppercase">2nd Place</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {Math.floor(tournament.prize_pool * 0.3)} PTS
          </div>
        </div>
      </div>

      {/* Entrants list */}
      <div className="p-6 bg-surface-elevated border border-surface-border rounded-xl">
        <h3 className="font-bold text-lg mb-3">Entrants ({entrantsCount})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tournament.tournament_entries?.map((entry, idx) => (
            <div
              key={entry.user_id}
              className="p-3 bg-surface border border-surface-border rounded text-xs flex items-center justify-between"
            >
              <span>#{idx + 1} Player {entry.user_id.slice(0, 6)}</span>
              {entry.checked_in && <span className="text-green-400 text-[10px] font-bold">READY</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
