'use client';

import Link from 'next/link';
import { formatEUR } from '../lib/currency';
import { getCountryByCode } from '@antigravity/core';

interface TournamentCardProps {
  id: string;
  name: string;
  format: string;
  size: number;
  entryFee: number;
  prizePool: number;
  status: string;
  gameTitle?: string;
  region?: string;
  countryCode?: string;
  enrolledCount?: number;
}

export function TournamentCard({
  id,
  name,
  format,
  size,
  entryFee,
  prizePool,
  status,
  gameTitle,
  region = 'Worldwide',
  countryCode,
  enrolledCount = 0,
}: TournamentCardProps) {
  const country = countryCode ? getCountryByCode(countryCode) : null;

  return (
    <div className="p-5 bg-[#111319] border border-[#202430] hover:border-[#C86228]/50 rounded-2xl flex flex-col justify-between gap-4 text-white shadow-md transition-all group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-[#C86228]/15 text-[#D97736] text-[10px] font-bold uppercase tracking-wider rounded">
              {format.replace(/_/g, ' ')}
            </span>
            <span className="px-2 py-0.5 bg-[#161922] border border-[#202430] text-gray-300 text-[10px] font-bold rounded flex items-center gap-1">
              {country ? `${country.flag} ${country.name}` : `🌍 ${region}`}
            </span>
          </div>

          <span
            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
              status === 'REGISTRATION' || status === 'OPEN'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : status === 'ACTIVE' || status === 'IN_PROGRESS'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/10 text-gray-400'
            }`}
          >
            {status.replace('_', ' ')}
          </span>
        </div>

        <h3 className="text-base font-bold tracking-tight text-white group-hover:text-[#D97736] transition-colors line-clamp-1">
          {name}
        </h3>
        {gameTitle && (
          <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mt-0.5">
            {gameTitle}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-[#0B0C10] border border-[#202430] rounded-xl text-center text-xs">
        <div>
          <span className="text-[9px] uppercase font-bold text-gray-500 block">Slots</span>
          <span className="font-mono font-bold text-white">
            {enrolledCount > 0 ? `${enrolledCount}/${size}` : `${size} Cap`}
          </span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-gray-500 block">Entry Fee</span>
          <span className="font-mono font-bold text-white">
            {entryFee === 0 ? <span className="text-green-400">FREE</span> : formatEUR(entryFee)}
          </span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-gray-500 block">Prize Pool</span>
          <span className="font-mono font-bold text-[#D97736]">
            {prizePool === 0 ? 'Trophies' : formatEUR(prizePool)}
          </span>
        </div>
      </div>

      <Link
        href={`/tournaments/${id}`}
        className="w-full py-2.5 bg-[#161922] group-hover:bg-[#C86228] group-hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center"
      >
        View Tournament Bracket
      </Link>
    </div>
  );
}
