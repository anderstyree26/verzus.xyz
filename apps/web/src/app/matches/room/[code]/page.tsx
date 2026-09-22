'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../../lib/api';

export default function JoinByRoomCodePage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    (async () => {
      try {
        const match = await apiClient<{ id: string }>(`/matches/room/${code}/join`, {
          method: 'POST',
        });
        router.push(`/matches/${match.id}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      }
    })();
  }, [code, router]);

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-surface-elevated border border-surface-border rounded-xl text-center">
      <h2 className="text-xl font-bold">Joining Room #{code}</h2>
      <p className="text-xs text-gray-400 mt-1">Connecting to private match lobby...</p>

      {error ? (
        <div className="mt-4 p-3 bg-red-950/60 border border-red-800 rounded text-xs text-red-300">
          {error}
        </div>
      ) : (
        <div className="mt-6 flex justify-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
