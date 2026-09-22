'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { LeaderboardTable } from '../../../components/LeaderboardTable';
import { apiClient } from '../../../lib/api';

interface LeaderboardEntry {
  userId: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
}

export default function GameTypeLeaderboardPage() {
  const params = useParams();
  const gameType = (params.gameType as string)?.toUpperCase();

  const { data: entries, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', gameType],
    queryFn: () => apiClient<LeaderboardEntry[]>(`/leaderboard/${gameType}`),
  });

  if (isLoading) {
    return <div className="p-12 text-center text-gray-400">Loading rankings...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <LeaderboardTable entries={entries ?? []} gameType={gameType} />
    </div>
  );
}
