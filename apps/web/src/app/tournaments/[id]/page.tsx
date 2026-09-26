'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { formatEUR } from '../../../lib/currency';

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#12121A] border border-[#1E1E2C] rounded-2xl text-center shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Prize Pool</span>
          <div className="text-2xl font-black font-mono text-[#FF5500] mt-1">
            {tournament.prize_pool > 0 ? formatEUR(tournament.prize_pool) : 'Glory & Trophies'}
          </div>
        </div>
        <div className="p-5 bg-[#12121A] border border-[#1E1E2C] rounded-2xl text-center shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">🥇 1st Place (50%)</span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {tournament.prize_pool > 0 ? formatEUR(tournament.prize_pool * 0.5) : 'Gold Trophy'}
          </div>
        </div>
        <div className="p-5 bg-[#12121A] border border-[#1E1E2C] rounded-2xl text-center shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">🥈 2nd Place (30%)</span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {tournament.prize_pool > 0 ? formatEUR(tournament.prize_pool * 0.3) : 'Silver Trophy'}
          </div>
        </div>
      </div>

      {/* Entrants list */}
      <div className="p-6 bg-[#12121A] border border-[#1E1E2C] rounded-2xl shadow-xl">
        <h3 className="font-black text-lg text-white mb-4">Registered Entrants ({entrantsCount})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tournament.tournament_entries?.map((entry, idx) => (
            <div
              key={entry.user_id}
              className="p-3 bg-[#0C0C12] border border-[#262638] rounded-xl text-xs flex items-center justify-between"
            >
              <span className="font-mono text-gray-300">#{idx + 1} Player {entry.user_id.slice(0, 6)}</span>
              {entry.checked_in && <span className="text-green-400 text-[10px] font-black uppercase">✓ READY</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
