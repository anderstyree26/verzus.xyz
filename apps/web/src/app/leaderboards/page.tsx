'use client';

import Link from 'next/link';

const GAME_ARCHETYPES = [
  { type: 'HIGH_SCORE', name: 'High Score Sprint', icon: '🎯', desc: 'Points & record chases (e.g. Subway Surfers)' },
  { type: 'HEAD_TO_HEAD', name: 'Head-to-Head Duel', icon: '⚔️', desc: 'Direct 1v1 matchups (e.g. CS2, EA FC, Rocket League)' },
  { type: 'LOW_TIME', name: 'Speedrun & Low Time', icon: '⏱️', desc: 'Lap times, clear times & fastest finishes' },
  { type: 'SURVIVAL', name: 'Survival & Battle Royale', icon: '🛡️', desc: 'Placement rank & last survivor standing' },
  { type: 'BINARY_RESULT', name: 'Win / Loss Matches', icon: '🏆', desc: 'Direct Victory or Defeat outcome verification' },
  { type: 'COMPOSITE_STAT', name: 'Composite Stats (KDA)', icon: '📊', desc: 'Combined kills, deaths, assists & impact rating' },
  { type: 'PROGRESSION', name: 'Progression & Waves', icon: '📈', desc: 'Highest round, level cleared or milestones' },
  { type: 'PHYSICAL', name: 'Physical Esports', icon: '⚡', desc: 'Hardware & peripheral verified challenges' },
] as const;

export default function LeaderboardsIndexPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* FACEIT Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#12121A] p-6 border border-[#1E1E2C] rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#1E1E2C] border border-[#262638] flex items-center justify-center text-2xl font-black text-[#FF5500]">
            🥇
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#FF5500]/15 text-[#FF5500] text-[10px] font-black uppercase tracking-wider rounded">
                Competitive Elo Ladders
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-0.5">
              Global Ranked Ladders
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Select an engine archetype to inspect Level 1–10 Elo ratings, win streaks, and season rankings.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {GAME_ARCHETYPES.map((arch) => (
          <Link
            key={arch.type}
            href={`/leaderboards/${arch.type}`}
            className="p-5 bg-[#12121A] border border-[#1E1E2C] hover:border-[#FF5500]/60 rounded-xl transition-all group flex flex-col justify-between h-40 shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{arch.icon}</span>
                <span className="text-[10px] font-mono text-[#FF5500] font-black uppercase">FACEIT ELO</span>
              </div>
              <h3 className="text-base font-black text-white group-hover:text-[#FF5500] transition-colors leading-tight">
                {arch.name}
              </h3>
              <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                {arch.desc}
              </p>
            </div>
            <span className="text-xs text-gray-400 group-hover:text-white font-mono flex items-center gap-1 font-bold">
              View Ladder →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
