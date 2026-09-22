'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BracketView } from '../../../../components/BracketView';
import { apiClient } from '../../../../lib/api';

interface MatchNode {
  id: string;
  bracket_round: number;
  bracket_position: number;
  player_a: string | null;
  player_b: string | null;
  winner: string | null;
  status: string;
}

export default function TournamentBracketPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: matches, isLoading } = useQuery<MatchNode[]>({
    queryKey: ['tournament-bracket', id],
    queryFn: () => apiClient<MatchNode[]>(`/tournaments/${id}/bracket`),
  });

  if (isLoading) {
    return <div className="p-12 text-center text-gray-400">Loading tournament bracket...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Tournament Bracket</h1>
        <p className="text-sm text-gray-400">Live progression and match results.</p>
      </div>

      <BracketView matches={matches ?? []} />
    </div>
  );
}
