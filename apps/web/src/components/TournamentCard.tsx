'use client';

import Link from 'next/link';

interface TournamentCardProps {
  id: string;
  name: string;
  format: string;
  size: number;
  entryFee: number;
  prizePool: number;
  status: string;
}

export function TournamentCard({
  id,
  name,
  format,
  size,
  entryFee,
  prizePool,
  status,
}: TournamentCardProps) {
  return (
    <div className="p-5 bg-surface-elevated border border-surface-border rounded-lg flex flex-col justify-between gap-4 text-white hover:border-accent/40 transition">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-accent font-semibold uppercase">{format.replace(/_/g, ' ')}</span>
          <span className="px-2 py-0.5 bg-white/10 text-xs rounded uppercase font-bold text-gray-300">
            {status}
          </span>
        </div>
        <h3 className="text-lg font-bold mt-1">{name}</h3>
      </div>

      <div className="grid grid-cols-3 gap-2 py-2 border-y border-surface-border text-center text-xs">
        <div>
          <span className="text-gray-400 block text-[10px] uppercase">Bracket</span>
          <span className="font-bold">{size} Slots</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase">Entry</span>
          <span className="font-bold">{entryFee === 0 ? 'FREE' : `${entryFee} PTS`}</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase">Prize</span>
          <span className="font-bold text-accent">{prizePool} PTS</span>
        </div>
      </div>

      <Link
        href={`/tournaments/${id}`}
        className="w-full py-2 bg-accent hover:bg-accent-600 font-bold text-xs rounded transition text-center"
      >
        View Tournament
      </Link>
    </div>
  );
}
