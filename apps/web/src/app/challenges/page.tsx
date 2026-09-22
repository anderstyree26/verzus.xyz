'use client';

import { useQuery } from '@tanstack/react-query';
import { ChallengeCard } from '../../components/ChallengeCard';
import { apiClient } from '../../lib/api';

interface ChallengeItem {
  id: string;
  game_profiles?: { display_name: string; game_type: string };
  entry_fee: number;
  prize_pool: number;
  created_by: string;
}

export default function ChallengesPage() {
  const { data: challenges, refetch } = useQuery<ChallengeItem[]>({
    queryKey: ['open-challenges'],
    queryFn: () => apiClient<ChallengeItem[]>('/matches/mine'), // in prod filters status=OPEN
  });

  const handleAccept = async (matchId: string) => {
    try {
      await apiClient(`/matches/${matchId}/accept`, { method: 'POST' });
      alert('Challenge accepted! Entering match room.');
      window.location.href = `/matches/${matchId}`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Could not accept: ${msg}`);
      refetch();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Open Challenge Board</h1>
        <p className="text-sm text-gray-400">Accept open challenges or test your skill in head-to-head competition.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges && challenges.length > 0 ? (
          challenges.map((c) => (
            <ChallengeCard
              key={c.id}
              id={c.id}
              gameTitle={c.game_profiles?.display_name ?? 'Universal Match'}
              gameType={c.game_profiles?.game_type ?? 'HIGH_SCORE'}
              entryFee={c.entry_fee}
              prizePool={c.prize_pool}
              creatorName={c.created_by?.slice(0, 8) ?? 'player'}
              onAccept={() => handleAccept(c.id)}
            />
          ))
        ) : (
          <div className="col-span-full p-12 text-center bg-surface-elevated border border-surface-border rounded-lg text-gray-500">
            No open challenges available right now. Click "Create Match" to post one!
          </div>
        )}
      </div>
    </div>
  );
}
