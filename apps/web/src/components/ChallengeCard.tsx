'use client';

import Link from 'next/link';
import { formatEUR } from '../lib/currency';
import { getCountryByCode } from '@antigravity/core';

interface ChallengeCardProps {
  id: string;
  gameTitle: string;
  gameType: string;
  entryFee: number;
  prizePool: number;
  creatorName: string;
  format?: string;
  countryCode?: string;
  mode?: string;
  onAccept?: () => void;
}

export function ChallengeCard({
  id,
  gameTitle,
  gameType,
  entryFee,
  prizePool,
  creatorName,
  format = 'BO1',
  countryCode,
  mode = '1v1',
  onAccept,
}: ChallengeCardProps) {
  const country = countryCode ? getCountryByCode(countryCode) : null;

  return (
    <div className="p-4 sm:p-5 bg-[#111319] border border-[#202430] hover:border-[#C86228]/50 rounded-xl flex flex-col justify-between gap-3.5 text-white shadow-md transition-all group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-[#C86228]/15 text-[#D97736] text-[10px] font-bold uppercase tracking-wider rounded">
              {mode}
            </span>
            <span className="px-2 py-0.5 bg-[#161922] text-gray-400 text-[10px] font-mono rounded">
              {format}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
            {country && <span title={country.name} className="text-sm">{country.flag}</span>}
            <span>@{creatorName}</span>
          </div>
        </div>

        <h3 className="text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-[#D97736] transition-colors truncate">
          {gameTitle}
        </h3>
        <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">
          Client-Side OCR Verified
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 py-2.5 px-3 bg-[#0B0C10] border border-[#202430] rounded-lg text-xs">
        <div>
          <span className="text-[9px] uppercase font-bold text-gray-500 block">Entry Fee</span>
          <span className="font-mono font-bold text-white">
            {entryFee === 0 ? <span className="text-green-400">FREE</span> : formatEUR(entryFee)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[9px] uppercase font-bold text-gray-500 block">Prize Pool</span>
          <span className="font-mono font-bold text-[#D97736]">
            {prizePool === 0 ? 'Honor & ELO' : formatEUR(prizePool)}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {onAccept ? (
          <button
            onClick={onAccept}
            className="w-full py-2 bg-[#C86228] hover:bg-[#D97736] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-sm"
          >
            Accept Duel
          </button>
        ) : (
          <Link
            href={`/matches/${id}`}
            className="w-full py-2 bg-[#161922] hover:bg-[#202430] text-gray-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all text-center"
          >
            Enter Matchroom
          </Link>
        )}
      </div>
    </div>
  );
}
