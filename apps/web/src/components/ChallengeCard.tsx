'use client';

import Link from 'next/link';

interface ChallengeCardProps {
  id: string;
  gameTitle: string;
  gameType: string;
  entryFee: number;
  prizePool: number;
  creatorName: string;
  onAccept?: () => void;
}

export function ChallengeCard({
  id,
  gameTitle,
  gameType,
  entryFee,
  prizePool,
  creatorName,
  onAccept,
}: ChallengeCardProps) {
  return (
    <div className="p-5 bg-surface-elevated border border-surface-border rounded-lg flex flex-col justify-between gap-4 text-white hover:border-accent/40 transition">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-accent font-semibold uppercase">{gameType}</span>
          <span className="text-xs text-gray-400 font-mono">By @{creatorName}</span>
        </div>
        <h3 className="text-lg font-bold mt-1">{gameTitle}</h3>
      </div>

      <div className="flex items-center justify-between py-2 border-y border-surface-border text-xs">
        <div>
          <span className="text-gray-400">Entry:</span>{' '}
          <span className="font-mono font-semibold">{entryFee === 0 ? 'FREE' : `${entryFee} PTS`}</span>
        </div>
        <div>
          <span className="text-gray-400">Prize Pool:</span>{' '}
          <span className="font-mono font-bold text-accent">{prizePool} PTS</span>
        </div>
      </div>

      <div className="flex gap-2">
        {onAccept ? (
          <button
            onClick={onAccept}
            className="flex-1 py-2 bg-accent hover:bg-accent-600 font-bold text-xs rounded transition text-center"
          >
            Accept Challenge
          </button>
        ) : (
          <Link
            href={`/matches/${id}`}
            className="flex-1 py-2 bg-accent hover:bg-accent-600 font-bold text-xs rounded transition text-center"
          >
            View Match
          </Link>
        )}
      </div>
    </div>
  );
}
