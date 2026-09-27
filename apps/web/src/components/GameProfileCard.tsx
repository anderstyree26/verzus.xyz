'use client';

import Link from 'next/link';

interface GameProfileCardProps {
  id: string;
  displayName: string;
  gameType: string;
  platform: string;
  platforms?: string[];
  isOfficial?: boolean;
}

export function GameProfileCard({
  id,
  displayName,
  gameType,
  platform,
  platforms,
  isOfficial,
}: GameProfileCardProps) {
  const platformDisplay = platforms && platforms.length > 0 ? platforms.join(' · ') : platform;

  return (
    <div className="p-5 bg-[#111319] border border-[#202430] hover:border-[#C86228]/60 rounded-2xl flex flex-col justify-between gap-4 text-white shadow-xl transition-all group">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#D97736] font-bold uppercase tracking-wider">{platformDisplay}</span>
          {isOfficial && (
            <span className="px-2 py-0.5 bg-[#C86228]/15 text-[#D97736] border border-[#C86228]/30 font-bold text-[10px] rounded uppercase">
              OFFICIAL
            </span>
          )}
        </div>
        <h3 className="text-lg font-black text-white group-hover:text-[#D97736] transition-colors mt-1.5">{displayName}</h3>
        <p className="text-xs text-gray-400 mt-1 font-mono">Engine: <span className="text-white font-bold">{gameType}</span></p>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/matches/new?profileId=${id}`}
          className="flex-1 py-2.5 bg-[#C86228] hover:bg-[#D97736] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition text-center shadow-md shadow-[#C86228]/20"
        >
          ⚔️ Play Duel
        </Link>
        <Link
          href={`/games/${id}`}
          className="px-3.5 py-2.5 bg-[#161922] hover:bg-[#202430] border border-[#202430] text-xs font-bold rounded-xl transition text-center text-gray-300 hover:text-white"
        >
          HUD Spec
        </Link>
      </div>
    </div>
  );
}
