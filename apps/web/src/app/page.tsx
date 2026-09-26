'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useGameStore } from '../lib/gameStore';
import { usePartyStore } from '../lib/partyStore';
import { EloBadge } from '../components/EloBadge';
import { ChallengeCard } from '../components/ChallengeCard';
import { apiClient } from '../lib/api';
import { formatEUR } from '../lib/currency';

interface ChallengeItem {
  id: string;
  game_profiles?: { display_name: string; game_type: string };
  entry_fee?: number;
  prize_pool?: number;
  created_by?: string;
  format?: string;
  country_code?: string;
  mode?: string;
}

export default function HomePage() {
  const { activeGame } = useGameStore();
  const { members } = usePartyStore();

  const gameTitle = activeGame?.displayName || 'Counter-Strike 2';
  const gamePlatform = activeGame?.platform || 'PC';
  const gameId = activeGame?.id || 'cs2';

  const { data: openChallenges } = useQuery<ChallengeItem[]>({
    queryKey: ['home-open-challenges'],
    queryFn: async () => {
      try {
        return await apiClient<ChallengeItem[]>('/matches/open');
      } catch {
        return await apiClient<ChallengeItem[]>('/matches/mine');
      }
    },
  });

  const topChallenges = (openChallenges || []).slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. FACEIT Hero Game Arena Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#1E1E2C] bg-[#101018] p-6 sm:p-10 shadow-2xl">
        {/* Cinematic Backdrop Glow */}
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#FF5500]/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            {/* Live Ticker & Verified Pill */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 bg-[#FF5500] text-black font-black text-[10px] uppercase tracking-wider rounded-md">
                Official Arena
              </span>
              <span className="px-2.5 py-1 bg-white/10 text-gray-300 font-mono text-[10px] font-bold rounded-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>1,429 PLAYERS IN QUEUE · 84 MATCHES LIVE</span>
              </span>
              <span className="px-2 py-0.5 bg-[#161622] text-gray-400 font-mono text-[10px] rounded border border-[#262638]">
                {gamePlatform}
              </span>
            </div>

            {/* Giant Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase mt-1">
              {gameTitle}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl leading-relaxed">
              Competitive skill matchmaking verified by in-browser OCR. Level 1–10 Elo rankings, instant 1v1 duels, and daily tournaments with guaranteed EUR (€) prize pools.
            </p>
          </div>

          {/* Master "PLAY" Action Launchers */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href={`/matches/new?profileId=${gameId}`}
              className="px-8 py-5 bg-[#FF5500] hover:bg-[#FF661A] text-black font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-[#FF5500]/30 transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-2"
            >
              <span className="text-lg">⚔️</span>
              <span>PLAY 1v1 DUEL</span>
            </Link>

            <Link
              href="/tournaments"
              className="px-6 py-5 bg-[#161622] hover:bg-[#1E1E2C] border border-[#262638] hover:border-[#FF5500]/50 text-white font-black text-sm uppercase tracking-wider rounded-2xl transition-all text-center flex items-center justify-center gap-2"
            >
              <span>🏆</span>
              <span>BROWSE CUPS</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Hub Layout: Queues & Player Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Competitive Queues */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Section Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FF5500]" />
              <h2 className="text-lg font-black tracking-tight text-white uppercase">
                Competitive Game Queues
              </h2>
            </div>
            <Link href="/challenges" className="text-xs text-[#FF5500] hover:underline font-bold">
              View All Duels →
            </Link>
          </div>

          {/* 4 Mode Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: 1v1 Ranked Duel */}
            <div className="p-5 bg-[#12121A] border border-[#1E1E2C] hover:border-[#FF5500]/60 rounded-2xl flex flex-col justify-between gap-4 transition group shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-[#FF5500]/15 text-[#FF5500] text-[10px] font-black uppercase rounded">
                    1v1 Ranked
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">BEST OF 1</span>
                </div>
                <h3 className="text-base font-black text-white group-hover:text-[#FF5500] transition-colors">
                  Solo Duel Ladder
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Sudden-death competitive match. Elo rating on the line. Free or Cash stakes.
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1E1E2C] text-xs">
                <span className="text-gray-400 font-mono">OCR Auto-Settle</span>
                <Link
                  href={`/matches/new?profileId=${gameId}`}
                  className="px-4 py-2 bg-[#FF5500] hover:bg-[#FF661A] text-black font-black text-xs uppercase tracking-wider rounded-lg transition"
                >
                  Queue 1v1
                </Link>
              </div>
            </div>

            {/* Card 2: Party vs Party Squad Battle */}
            <div className="p-5 bg-[#12121A] border border-[#1E1E2C] hover:border-[#FF5500]/60 rounded-2xl flex flex-col justify-between gap-4 transition group shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase rounded border border-blue-500/30">
                    Squad Battle
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    {members.length > 1 ? `${members.length} Squad` : 'Up to 5v5'}
                  </span>
                </div>
                <h3 className="text-base font-black text-white group-hover:text-[#FF5500] transition-colors">
                  Party vs Party Arena
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Queue with your friends using the persistent bottom party bar. Team Elo ranking.
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1E1E2C] text-xs">
                <span className="text-gray-400 font-mono">Party Dock Ready</span>
                <Link
                  href={`/matches/new?profileId=${gameId}`}
                  className="px-4 py-2 bg-[#1E1E2C] hover:bg-[#262638] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition"
                >
                  Party Queue
                </Link>
              </div>
            </div>

            {/* Card 3: Weekly Championship Cup */}
            <div className="p-5 bg-[#12121A] border border-[#1E1E2C] hover:border-[#FF5500]/60 rounded-2xl flex flex-col justify-between gap-4 transition group shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-black uppercase rounded border border-green-500/30">
                    Championship
                  </span>
                  <span className="text-[10px] font-mono text-[#FF5500] font-bold">€1,000 EUR</span>
                </div>
                <h3 className="text-base font-black text-white group-hover:text-[#FF5500] transition-colors">
                  Weekly Masters Cup
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  16-player bracket tree. Single elimination. Guaranteed cash payout for top 3.
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1E1E2C] text-xs">
                <span className="text-gray-400 font-mono">Check-in in 2h</span>
                <Link
                  href="/tournaments"
                  className="px-4 py-2 bg-[#1E1E2C] hover:bg-[#262638] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition"
                >
                  Join Bracket
                </Link>
              </div>
            </div>

            {/* Card 4: Daily Elo Grind Ladder */}
            <div className="p-5 bg-[#12121A] border border-[#1E1E2C] hover:border-[#FF5500]/60 rounded-2xl flex flex-col justify-between gap-4 transition group shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase rounded border border-yellow-500/30">
                    Daily Ladder
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">RESET 24H</span>
                </div>
                <h3 className="text-base font-black text-white group-hover:text-[#FF5500] transition-colors">
                  Daily Elo Sprint
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Accumulate Elo gains through consecutive wins. Top 10 players win bonus EUR cash.
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1E1E2C] text-xs">
                <span className="text-gray-400 font-mono">Leaderboard Active</span>
                <Link
                  href="/leaderboards"
                  className="px-4 py-2 bg-[#1E1E2C] hover:bg-[#262638] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition"
                >
                  Ladder View
                </Link>
              </div>
            </div>
          </div>

          {/* 3. Live Open Challenges Waiting for Opponent */}
          <div className="mt-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <h3 className="text-sm font-black tracking-tight text-white uppercase">
                  Live Challenges Awaiting Opponents
                </h3>
              </div>
              <Link href="/challenges" className="text-xs text-gray-400 hover:text-white font-semibold">
                See All ({openChallenges?.length || 0})
              </Link>
            </div>

            {topChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topChallenges.map((c) => (
                  <ChallengeCard
                    key={c.id}
                    id={c.id}
                    gameTitle={c.game_profiles?.display_name || gameTitle}
                    gameType={c.game_profiles?.game_type || 'HIGH_SCORE'}
                    entryFee={c.entry_fee || 0}
                    prizePool={c.prize_pool || 0}
                    creatorName={c.created_by?.slice(0, 8) || 'challenger'}
                    format={c.format || 'BO1'}
                    countryCode={c.country_code}
                    mode={c.mode || '1v1'}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 bg-[#12121A] border border-[#1E1E2C] rounded-2xl text-center">
                <p className="text-xs text-gray-400">No open duels currently in this queue.</p>
                <Link
                  href={`/matches/new?profileId=${gameId}`}
                  className="mt-3 inline-block px-4 py-2 bg-[#FF5500] hover:bg-[#FF661A] text-black font-black text-xs uppercase tracking-wider rounded-lg transition"
                >
                  Post First VS Duel
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): FACEIT Player Card & Elo Meter */}
        <div className="flex flex-col gap-6">
          {/* FACEIT Player Stats Card */}
          <div className="p-6 bg-[#12121A] border border-[#1E1E2C] rounded-2xl shadow-xl flex flex-col gap-5">
            {/* Header: Avatar, Name & Level Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1E1E2C]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-[#FF5500] flex items-center justify-center font-black text-black text-lg shadow-md shadow-[#FF5500]/20">
                  U
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-base text-white">PlayerOne</span>
                    <span className="text-sm">🇩🇪</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">Ranked Competitor</span>
                </div>
              </div>

              {/* Polygonal Level Badge */}
              <EloBadge elo={1650} size="lg" />
            </div>

            {/* Elo Rating & Progress to Next Level */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-400 font-mono text-[11px] uppercase">
                  Level 7 · <strong className="text-white">1,650 ELO</strong>
                </span>
                <span className="text-gray-400 font-mono text-[11px]">
                  Next: <strong className="text-[#FF5500]">Level 8 (1,701)</strong>
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#0C0C12] border border-[#1E1E2C] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#FF5500] to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: '72%' }}
                />
              </div>
              <span className="text-[10px] text-gray-500 font-mono mt-1 block text-right">
                51 Elo to Level 8
              </span>
            </div>

            {/* Match Stats Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-[#0C0C12] border border-[#1E1E2C] rounded-xl text-center text-xs">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Win Rate</span>
                <span className="font-mono font-black text-green-400 text-sm">64.2%</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Record</span>
                <span className="font-mono font-bold text-white text-xs">28W - 16L</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Streak</span>
                <span className="font-mono font-black text-[#FF5500] text-sm">🔥 4W</span>
              </div>
            </div>

            {/* Recent Match Form Dots (FACEIT Signature) */}
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-2">
                Recent 5 Matches Form
              </span>
              <div className="flex items-center gap-2">
                {['W', 'W', 'L', 'W', 'W'].map((res, i) => (
                  <div
                    key={i}
                    className={`flex-1 py-1 rounded text-center font-mono font-black text-xs ${
                      res === 'W'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {res}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Wallet Summary */}
            <div className="p-3.5 bg-[#0C0C12] border border-[#1E1E2C] rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-gray-400 uppercase block font-semibold">Available EUR Cash</span>
                <span className="font-mono font-black text-green-400 text-base">{formatEUR(0)}</span>
              </div>
              <Link
                href="/dashboard"
                className="px-3 py-1.5 bg-[#161622] hover:bg-[#1E1E2C] border border-[#262638] text-white text-[11px] font-bold rounded-lg transition"
              >
                Deposit +
              </Link>
            </div>
          </div>

          {/* Quick Ladder Top 3 Widget */}
          <div className="p-5 bg-[#12121A] border border-[#1E1E2C] rounded-2xl shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                🥇 {gameTitle} Top Elo
              </span>
              <Link href="/leaderboards" className="text-[11px] text-[#FF5500] hover:underline font-bold">
                Full Ladder
              </Link>
            </div>

            <div className="flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2 bg-[#0C0C12] rounded-lg border border-[#1E1E2C]">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">#1</span>
                  <EloBadge elo={2350} size="sm" />
                  <span className="font-sans font-bold text-white">s1mple_pro</span>
                </div>
                <span className="font-black text-white">2,350</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#0C0C12] rounded-lg border border-[#1E1E2C]">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 font-bold">#2</span>
                  <EloBadge elo={2180} size="sm" />
                  <span className="font-sans font-bold text-white">zywoo_god</span>
                </div>
                <span className="font-black text-white">2,180</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#0C0C12] rounded-lg border border-[#1E1E2C]">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 font-bold">#3</span>
                  <EloBadge elo={2040} size="sm" />
                  <span className="font-sans font-bold text-white">niko_deagle</span>
                </div>
                <span className="font-black text-white">2,040</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
