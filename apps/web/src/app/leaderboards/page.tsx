'use client';

import Link from 'next/link';

const GAME_TYPES = [
  'HIGH_SCORE',
  'LOW_TIME',
  'SURVIVAL',
  'HEAD_TO_HEAD',
  'BINARY_RESULT',
  'COMPOSITE_STAT',
  'PROGRESSION',
  'PHYSICAL',
] as const;

export default function LeaderboardsIndexPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Global Leaderboards</h1>
        <p className="text-sm text-gray-400">Select an engine archetype to view player Elo ratings and stats.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {GAME_TYPES.map((type) => (
          <Link
            key={type}
            href={`/leaderboards/${type}`}
            className="p-6 bg-surface-elevated border border-surface-border rounded-lg hover:border-accent/50 transition flex flex-col justify-between h-32"
          >
            <span className="text-xs text-accent font-bold uppercase">Game Type</span>
            <span className="text-lg font-bold text-white">{type.replace(/_/g, ' ')}</span>
            <span className="text-xs text-gray-500 font-mono">View rankings →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
