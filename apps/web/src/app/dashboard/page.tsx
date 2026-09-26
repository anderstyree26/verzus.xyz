'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { WalletCard } from '../../components/WalletCard';
import { EloBadge } from '../../components/EloBadge';
import { apiClient } from '../../lib/api';
import { useGameStore } from '../../lib/gameStore';
import { formatEUR } from '../../lib/currency';

interface MatchItem {
  id: string;
  format: string;
  status: string;
  entry_fee: number;
  prize_pool: number;
  created_at: string;
  room_code?: string;
}

export default function DashboardPage() {
  const { activeGame } = useGameStore();

  const { data: matches, isLoading } = useQuery<MatchItem[]>({
    queryKey: ['my-matches'],
    queryFn: () => apiClient<MatchItem[]>('/matches/mine'),
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Player Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#12121A] border border-[#1E1E2C] rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FF5500] text-black font-black text-2xl flex items-center justify-center shadow-lg shadow-[#FF5500]/20">
            VX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                Competitive Dashboard
              </span>
              {activeGame && (
                <span className="text-xs px-2 py-0.5 bg-[#FF5500]/15 text-[#FF5500] font-black rounded">
                  🎮 {activeGame.displayName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Player Command Center
              </h1>
              <EloBadge elo={1650} size="md" showLabel />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/matches/new"
            className="px-5 py-2.5 bg-[#FF5500] hover:bg-[#FF661A] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#FF5500]/20"
          >
            ⚔️ Host VS Match
          </Link>
          <Link
            href="/challenges"
            className="px-5 py-2.5 bg-[#161622] hover:bg-[#1E1E2C] border border-[#262638] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
          >
            Find Duels
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WalletCard />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="p-6 bg-[#12121A] border border-[#1E1E2C] rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E1E2C]">
              <div>
                <h3 className="font-black text-lg text-white">Recent Match History</h3>
                <p className="text-xs text-gray-400">Head-to-head duels and tournament matches</p>
              </div>
              <span className="text-xs font-mono text-gray-400">
                {matches?.length ?? 0} Total Records
              </span>
            </div>

            {isLoading ? (
              <p className="text-sm text-gray-400 py-6 text-center font-mono animate-pulse">Loading match record...</p>
            ) : matches && matches.length > 0 ? (
              <div className="divide-y divide-[#1E1E2C]">
                {matches.map((m) => (
                  <div key={m.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">VS Match #{m.id.slice(0, 8)}</span>
                        {m.room_code && (
                          <span className="px-1.5 py-0.2 bg-[#161622] text-gray-400 font-mono text-[10px] rounded">
                            {m.room_code}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        Format: <strong className="text-gray-200">{m.format}</strong> · Prize:{' '}
                        <strong className="text-[#FF5500]">
                          {m.prize_pool > 0 ? formatEUR(m.prize_pool) : 'Glory & Elo'}
                        </strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 font-black text-[10px] uppercase rounded-lg border ${
                          m.status === 'SETTLED'
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                            : m.status === 'OPEN'
                            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                            : 'bg-green-500/10 border-green-500/30 text-green-400'
                        }`}
                      >
                        {m.status}
                      </span>
                      <Link
                        href={`/matches/${m.id}`}
                        className="px-3 py-1.5 bg-[#1E1E2C] hover:bg-[#262638] text-xs rounded-lg font-bold text-white transition"
                      >
                        Matchroom →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <div className="text-2xl mb-1">🎮</div>
                <p className="text-sm font-semibold text-gray-400">No match records yet.</p>
                <p className="text-xs text-gray-500 mt-1">Host or join a VS duel to start climbing the ladder!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
