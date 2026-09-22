'use client';

interface LeaderboardEntry {
  userId: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  gameType: string;
}

export function LeaderboardTable({ entries, gameType }: LeaderboardTableProps) {
  return (
    <div className="bg-surface-elevated border border-surface-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-surface-border flex justify-between items-center">
        <h3 className="font-bold text-lg text-white">Global Leaderboard — {gameType}</h3>
        <span className="text-xs text-accent font-semibold font-mono">Elo System (K=32)</span>
      </div>

      <table className="w-full text-left text-sm text-gray-300">
        <thead className="bg-surface text-xs uppercase text-gray-400 border-b border-surface-border">
          <tr>
            <th className="py-3 px-4">Rank</th>
            <th className="py-3 px-4">Player</th>
            <th className="py-3 px-4">Rating</th>
            <th className="py-3 px-4">Record</th>
            <th className="py-3 px-4">Win Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border font-mono text-xs">
          {entries.map((e, index) => {
            const winRate = e.gamesPlayed > 0 ? ((e.wins / e.gamesPlayed) * 100).toFixed(1) : '0.0';
            return (
              <tr key={e.userId} className="hover:bg-white/[0.02] transition">
                <td className="py-3 px-4 font-bold text-accent">#{index + 1}</td>
                <td className="py-3 px-4 font-sans font-medium text-white">
                  Player #{e.userId.slice(0, 8)}
                </td>
                <td className="py-3 px-4 font-bold text-white">{e.rating}</td>
                <td className="py-3 px-4">
                  <span className="text-green-400">{e.wins}W</span> - <span className="text-red-400">{e.losses}L</span>
                </td>
                <td className="py-3 px-4 text-gray-400">{winRate}%</td>
              </tr>
            );
          })}
          {entries.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-500 font-sans">
                No rated matches played for this game type yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
