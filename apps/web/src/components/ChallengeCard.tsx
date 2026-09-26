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
    <div className="p-5 bg-[#12121A] border border-[#1E1E2C] hover:border-[#FF5500]/60 rounded-xl flex flex-col justify-between gap-4 text-white shadow-lg transition-all group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#FF5500]/15 text-[#FF5500] text-[10px] font-black uppercase tracking-wider rounded">
              {mode}
            </span>
            <span className="px-2 py-0.5 bg-white/10 text-gray-300 text-[10px] font-bold rounded">
              {format}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
            {country && <span title={country.name} className="text-sm">{country.flag}</span>}
            <span>@{creatorName}</span>
          </div>
        </div>

        <h3 className="text-base font-black tracking-tight text-white group-hover:text-[#FF5500] transition-colors truncate">
          {gameTitle}
        </h3>
        <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
          {gameType.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 py-3 px-3 bg-[#0C0C12] border border-[#1E1E2C] rounded-lg text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-500 block">Entry Fee</span>
          <span className="font-mono font-bold text-white">
            {entryFee === 0 ? <span className="text-green-400">FREE</span> : formatEUR(entryFee)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-gray-500 block">Prize Pool</span>
          <span className="font-mono font-black text-[#FF5500]">
            {prizePool === 0 ? 'Honor & ELO' : formatEUR(prizePool)}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {onAccept ? (
          <button
            onClick={onAccept}
            className="w-full py-2.5 bg-[#FF5500] hover:bg-[#FF661A] text-black font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-md shadow-[#FF5500]/10"
          >
            Accept VS Duel
          </button>
        ) : (
          <Link
            href={`/matches/${id}`}
            className="w-full py-2.5 bg-[#1E1E2C] hover:bg-[#262638] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all text-center"
          >
            Enter Matchroom
          </Link>
        )}
      </div>
    </div>
  );
}
