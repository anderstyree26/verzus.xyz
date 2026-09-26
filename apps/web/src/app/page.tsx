import Link from 'next/link';
import { EloBadge } from '../components/EloBadge';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center">
      {/* Top Banner Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FF5500]/10 border border-[#FF5500]/30 rounded-full text-xs font-bold text-[#FF5500] mb-8">
        <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
        <span>THE GLOBAL COMPETITIVE ARENA · FACEIT-STYLE SKILL ESPORTS · OCR POWERED</span>
      </div>

      {/* Main Punchy Hero Title */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.08]">
        COMPETE IN ANY GAME. <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-[#FF7700] to-yellow-500">
          CLIMB THE LADDER. WIN EUROS.
        </span>
      </h1>

      <p className="mt-5 text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
        VerzusXYZ is the skill-based competitive home for PC, Console, and Mobile gamers. Play instant 1v1 duels or Party matches, compete in regional cups with guaranteed EUR (€) prize pools, and let client-side OCR verify every match result.
      </p>

      {/* CTA Buttons */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center items-center">
        <Link
          href="/challenges"
          className="px-8 py-4 bg-[#FF5500] hover:bg-[#FF661A] text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-[#FF5500]/25 transform hover:-translate-y-0.5"
        >
          ⚔️ Play VS Duels
        </Link>
        <Link
          href="/tournaments"
          className="px-8 py-4 bg-[#12121A] hover:bg-[#1E1E2C] border border-[#262638] text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all"
        >
          🏆 Browse Tournaments
        </Link>
        <Link
          href="/signup"
          className="px-6 py-4 bg-[#161622] hover:bg-[#1E1E2C] border border-[#FF5500]/30 text-[#FF5500] font-black text-xs uppercase tracking-wider rounded-xl transition-all"
        >
          🎁 Claim 10,000 Free Points
        </Link>
      </div>

      {/* FACEIT Elo Level Bar Preview */}
      <div className="mt-14 p-4 sm:p-5 bg-[#12121A] border border-[#1E1E2C] rounded-2xl w-full max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Official Skill Rating</span>
            <span className="text-sm font-black text-white">FACEIT-Standard 1–10 Elo Tiers</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {[400, 850, 1000, 1150, 1300, 1450, 1600, 1750, 1900, 2100].map((elo) => (
            <EloBadge key={elo} elo={elo} size="sm" />
          ))}
        </div>
      </div>

      {/* 3 Pillar Features */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
        <div className="p-7 bg-[#12121A] border border-[#1E1E2C] hover:border-[#FF5500]/40 rounded-2xl transition group">
          <div className="w-12 h-12 rounded-xl bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] flex items-center justify-center font-black text-xl mb-4 group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <h3 className="text-lg font-black text-white">Instant "VS" Matchrooms</h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Jump into 1v1 duels or Party matches. Features interactive 60-second ready checks, server/side coin flips, and automatic matchroom lobbies.
          </p>
        </div>

        <div className="p-7 bg-[#12121A] border border-[#1E1E2C] hover:border-[#FF5500]/40 rounded-2xl transition group">
          <div className="w-12 h-12 rounded-xl bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] flex items-center justify-center font-black text-xl mb-4 group-hover:scale-105 transition-transform">
            👁️
          </div>
          <h3 className="text-lg font-black text-white">Universal Client-Side OCR</h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            No game APIs, mods, or intrusive kernel drivers needed. Our browser computer vision pipeline reads scores directly from your screen share with cryptographic anti-cheat telemetry.
          </p>
        </div>

        <div className="p-7 bg-[#12121A] border border-[#1E1E2C] hover:border-[#FF5500]/40 rounded-2xl transition group">
          <div className="w-12 h-12 rounded-xl bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] flex items-center justify-center font-black text-xl mb-4 group-hover:scale-105 transition-transform">
            💶
          </div>
          <h3 className="text-lg font-black text-white">Guaranteed EUR (€) Stakes</h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Pure skill-gaming compliance across 249 recognized territories. Entry stakes are held in escrow with transparent guaranteed prize payouts via Paysafe.
          </p>
        </div>
      </div>
    </div>
  );
}
