'use client';

import { EloBadge } from './EloBadge';

interface LeaderboardEntry {
  userId: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  username?: string;
  countryCode?: string;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  gameType: string;
}

export function LeaderboardTable({ entries, gameType }: LeaderboardTableProps) {
  return (
    <div className="bg-[#12121A] border border-[#1E1E2C] rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-5 border-b border-[#1E1E2C] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="font-black text-lg text-white">Global Ladder & Rankings</h3>
          <span className="text-xs text-gray-400">Category: <strong className="text-white uppercase font-bold">{gameType.replace(/_/g, ' ')}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] font-black uppercase tracking-wider rounded-lg font-mono">
            FACEIT ELO (K=32)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#0C0C12] text-[11px] uppercase font-bold text-gray-400 border-b border-[#1E1E2C]">
            <tr>
              <th className="py-3.5 px-4">Rank</th>
              <th className="py-3.5 px-4">Level</th>
              <th className="py-3.5 px-4">Gamer / Tag</th>
              <th className="py-3.5 px-4">Elo Rating</th>
              <th className="py-3.5 px-4">Match Record</th>
              <th className="py-3.5 px-4">Win Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E1E2C] font-mono text-xs">
            {entries.map((e, index) => {
              const winRate = e.gamesPlayed > 0 ? ((e.wins / e.gamesPlayed) * 100).toFixed(1) : '0.0';
              const isTop1 = index === 0;
              const isTop2 = index === 1;
              const isTop3 = index === 2;

              return (
                <tr
                  key={e.userId}
                  className={`hover:bg-white/[0.03] transition ${
                    isTop1 ? 'bg-amber-500/[0.04]' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-black">
                    {isTop1 ? (
                      <span className="text-amber-400 text-sm">🥇 #1</span>
                    ) : isTop2 ? (
                      <span className="text-gray-300 text-sm">🥈 #2</span>
                    ) : isTop3 ? (
                      <span className="text-amber-600 text-sm">🥉 #3</span>
                    ) : (
                      <span className="text-gray-500">#{index + 1}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <EloBadge elo={e.rating} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 font-sans font-bold text-white">
                    {e.username ? `@${e.username}` : `Player #${e.userId.slice(0, 8)}`}
                  </td>
                  <td className="py-3.5 px-4 font-black text-white">{e.rating}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-green-400 font-bold">{e.wins}W</span>
                    <span className="text-gray-500 mx-1">-</span>
                    <span className="text-red-400 font-bold">{e.losses}L</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-300 font-bold">{winRate}%</td>
                </tr>
              );
            })}
            {entries.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500 font-sans">
                  No rated matches completed for this ladder archetype yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
