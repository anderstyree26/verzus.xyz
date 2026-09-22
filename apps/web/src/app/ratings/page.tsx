'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';

interface RatingItem {
  id: string;
  game_type: string;
  rating: number;
  games_played: number;
  wins: number;
  losses: number;
}

export default function MyRatingsPage() {
  const { data: ratings, isLoading } = useQuery<RatingItem[]>({
    queryKey: ['my-ratings'],
    queryFn: () => apiClient<RatingItem[]>('/ratings/me'),
  });

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Competitive Ratings</h1>
        <p className="text-sm text-gray-400">Elo ratings tracked across all game types.</p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-400">Loading your ratings...</div>
      ) : ratings && ratings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ratings.map((r) => (
            <div key={r.id} className="p-5 bg-surface-elevated border border-surface-border rounded-lg text-white">
              <span className="text-xs text-accent font-bold uppercase">{r.game_type}</span>
              <div className="text-3xl font-extrabold font-mono text-white mt-1">{r.rating}</div>
              <div className="mt-3 flex justify-between text-xs text-gray-400 border-t border-surface-border pt-2">
                <span>Record: <b className="text-green-400">{r.wins}W</b> - <b className="text-red-400">{r.losses}L</b></span>
                <span>Played: {r.games_played}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-surface-elevated border border-surface-border rounded-lg text-gray-500">
          No ratings found. Play your first match to start climbing the leaderboards!
        </div>
      )}
    </div>
  );
}
