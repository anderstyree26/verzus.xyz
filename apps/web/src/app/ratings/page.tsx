'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { EloBadge } from '../../components/EloBadge';
import { OFFICIAL_GAMES, type CatalogGame } from '../../lib/gamesCatalog';
import { useGameStore } from '../../lib/gameStore';

interface RatingItem {
  id: string;
  game_type: string;
  rating: number;
  games_played: number;
  wins: number;
  losses: number;
}

interface UserProfile {
  id: string;
  username: string;
  rating?: number;
}

export default function MyRatingsPage() {
  const { setActiveGame } = useGameStore();

  const { data: userProfile } = useQuery<UserProfile | null>({
    queryKey: ['ratings-user-me'],
    queryFn: () => apiClient<UserProfile>('/profile/me').catch(() => null),
    staleTime: 30000,
  });

  const { data: ratings, isLoading } = useQuery<RatingItem[]>({
    queryKey: ['my-ratings'],
    queryFn: () => apiClient<RatingItem[]>('/ratings/me').catch(() => []),
  });

  // Map ratings by underlying gameType
  const ratingsByEngine = new Map<string, RatingItem>();
  (ratings || []).forEach((r) => {
    ratingsByEngine.set(r.game_type.toUpperCase(), r);
  });

  const defaultUserElo = userProfile?.rating ?? 1000;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 bg-[#111319] border border-[#202430] rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#161922] border border-[#202430] flex items-center justify-center text-3xl font-black text-[#D97736] shadow-inner">
            🥇
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#C86228]/15 text-[#D97736] border border-[#C86228]/30 text-[10px] font-bold uppercase tracking-wider rounded">
                Skill Index
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              My Competitive Ratings & Tiers
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Level 1 to 10 skill rankings across each esports title. All outcomes verified by automated instant match sync.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/leaderboards"
            className="px-5 py-3 bg-[#161922] hover:bg-[#202430] border border-[#202430] text-gray-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2"
          >
            <span>🏆</span>
            <span>Global Ladders</span>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-400 font-mono text-xs bg-[#111319] border border-[#202430] rounded-2xl animate-pulse">
          Loading your competitive ratings...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OFFICIAL_GAMES.map((game) => {
            const userRatingRecord = ratingsByEngine.get(game.gameType.toUpperCase());
            const rating = userRatingRecord?.rating ?? defaultUserElo;
            const wins = userRatingRecord?.wins ?? 0;
            const losses = userRatingRecord?.losses ?? 0;
            const gamesPlayed = userRatingRecord?.games_played ?? 0;
            const winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) : '0.0';

            return (
              <div
                key={game.id}
                className="p-5 bg-[#111319] border border-[#202430] hover:border-[#C86228]/50 rounded-2xl flex flex-col justify-between gap-4 text-white shadow-xl transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{game.icon}</span>
                    <EloBadge elo={rating} size="sm" />
                  </div>

                  <h3 className="text-base font-black text-white group-hover:text-[#D97736] transition-colors mt-2">
                    {game.displayName}
                  </h3>
                  <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">
                    {game.platform} · {game.shortName}
                  </span>

                  <div className="mt-3 flex items-baseline justify-between border-b border-[#202430] pb-2">
                    <span className="text-xs text-gray-400 font-mono">Elo Rating:</span>
                    <span className="text-xl font-black font-mono text-white">{rating}</span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-gray-500 block text-[9px] uppercase">Record</span>
                      <span className="text-green-400 font-bold">{wins}W</span>
                      <span className="text-gray-500 mx-1">-</span>
                      <span className="text-red-400 font-bold">{losses}L</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 block text-[9px] uppercase">Win Rate</span>
                      <span className="text-gray-300 font-bold">{winRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-[#202430]">
                  <Link
                    href={`/matches/new?profileId=${game.id}`}
                    onClick={() => setActiveGame(game)}
                    className="flex-1 py-2 bg-[#C86228] hover:bg-[#D97736] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition text-center shadow-sm"
                  >
                    Play Duel
                  </Link>
                  <Link
                    href={`/leaderboards/${game.id}`}
                    onClick={() => setActiveGame(game)}
                    className="px-3 py-2 bg-[#161922] hover:bg-[#202430] border border-[#202430] text-gray-300 hover:text-white font-bold text-xs uppercase rounded-lg transition text-center"
                  >
                    Ladder
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
