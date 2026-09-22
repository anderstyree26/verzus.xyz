'use client';

import Link from 'next/link';

interface GameProfileCardProps {
  id: string;
  displayName: string;
  gameType: string;
  platform: string;
  isOfficial?: boolean;
}

export function GameProfileCard({
  id,
  displayName,
  gameType,
  platform,
  isOfficial,
}: GameProfileCardProps) {
  return (
    <div className="p-5 bg-surface-elevated border border-surface-border rounded-lg flex flex-col justify-between gap-4 text-white hover:border-accent/40 transition">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-accent font-semibold uppercase">{platform}</span>
          {isOfficial && (
            <span className="px-2 py-0.5 bg-accent/20 text-accent font-bold text-[10px] rounded">
              OFFICIAL
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold mt-1">{displayName}</h3>
        <p className="text-xs text-gray-400 mt-1 font-mono">Engine: {gameType}</p>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/matches/new?profileId=${id}`}
          className="flex-1 py-2 bg-accent hover:bg-accent-600 font-bold text-xs rounded transition text-center"
        >
          Create Match
        </Link>
        <Link
          href={`/games/${id}`}
          className="px-3 py-2 bg-surface hover:bg-surface-border border border-surface-border text-xs rounded transition text-center"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
