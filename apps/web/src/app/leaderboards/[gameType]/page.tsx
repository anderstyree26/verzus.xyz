'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { LeaderboardTable } from '../../../components/LeaderboardTable';
import { apiClient } from '../../../lib/api';
import { OFFICIAL_GAMES, getGameById } from '../../../lib/gamesCatalog';

interface LeaderboardEntry {
  userId: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  username?: string;
  countryCode?: string;
}

export default function GameLeaderboardDynamicPage() {
  const params = useParams();
  const rawParam = (params.gameType as string) || 'cs2';

  // Check if rawParam matches a game id or displayName
  const matchedGame = OFFICIAL_GAMES.find(
    (g) => g.id.toLowerCase() === rawParam.toLowerCase() || g.gameType.toLowerCase() === rawParam.toLowerCase()
  ) || getGameById(rawParam);

  const engineType = matchedGame.gameType;

  const { data: entries, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', engineType],
    queryFn: () => apiClient<LeaderboardEntry[]>(`/leaderboard/${engineType}`),
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/leaderboards"
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-bold"
        >
          ← All Game Ladders
        </Link>
        <Link
          href={`/matches/new?profileId=${matchedGame.id}`}
          className="px-4 py-2 bg-[#C86228] hover:bg-[#D97736] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-[#C86228]/20"
        >
          ⚔️ Play {matchedGame.displayName} Duel
        </Link>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-400 font-mono text-xs bg-[#111319] border border-[#202430] rounded-2xl animate-pulse">
          Loading {matchedGame.displayName} rankings...
        </div>
      ) : (
        <LeaderboardTable
          entries={entries ?? []}
          gameTitle={matchedGame.displayName}
          gameIcon={matchedGame.icon}
          gameType={matchedGame.gameType}
        />
      )}
    </div>
  );
}
