'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { TournamentCard } from '../../components/TournamentCard';
import { apiClient } from '../../lib/api';
import { useGameStore } from '../../lib/gameStore';
import { GLOBAL_REGIONS } from '@antigravity/core';

interface TournamentItem {
  id: string;
  name: string;
  format: string;
  size: number;
  entry_fee: number;
  prize_pool: number;
  status: string;
  game_profiles?: { display_name: string; id?: string };
  region?: string;
  country_code?: string;
  enrolled_count?: number;
}

export default function TournamentsPage() {
  const { activeGame } = useGameStore();
  const [filterGameOnly, setFilterGameOnly] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [feeFilter, setFeeFilter] = useState<'ALL' | 'FREE' | 'CASH'>('ALL');

  const { data: tournaments, isLoading } = useQuery<TournamentItem[]>({
    queryKey: ['tournaments-list'],
    queryFn: () => apiClient<TournamentItem[]>('/tournaments'),
  });

  const filteredTournaments = (tournaments || []).filter((t) => {
    if (filterGameOnly && activeGame) {
      const tName = (t.name + ' ' + (t.game_profiles?.display_name || '')).toLowerCase();
      const activeName = activeGame.displayName.toLowerCase();
      if (!tName.includes(activeName)) {
        return false;
      }
    }

    if (selectedRegion !== 'All' && t.region && t.region !== selectedRegion) {
      return false;
    }

    if (feeFilter === 'FREE' && (t.entry_fee || 0) > 0) return false;
    if (feeFilter === 'CASH' && (t.entry_fee || 0) === 0) return false;

    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* FACEIT Carbon Tournament Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#12121A] p-6 border border-[#1E1E2C] rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#1E1E2C] border border-[#262638] flex items-center justify-center text-2xl font-black text-[#FF5500]">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#FF5500]/15 text-[#FF5500] text-[10px] font-black uppercase tracking-wider rounded">
                Official & Community Cups
              </span>
              {activeGame && (
                <span className="text-xs text-gray-400 font-semibold">
                  Title: <strong className="text-white">{activeGame.displayName}</strong>
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-0.5">
              Tournaments & Championships
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Single & double elimination brackets, Swiss ladders, and national cups with guaranteed EUR prize pools.
            </p>
          </div>
        </div>

        <Link
          href={activeGame ? `/tournaments/new?profileId=${activeGame.id}` : '/tournaments/new'}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF5500] hover:bg-[#FF661A] text-black font-extrabold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#FF5500]/25"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Host Tournament
        </Link>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0C0C12] border border-[#1E1E2C] rounded-xl text-xs">
        <div className="flex items-center gap-2">
          {activeGame && (
            <button
              onClick={() => setFilterGameOnly(!filterGameOnly)}
              className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                filterGameOnly
                  ? 'bg-[#FF5500]/20 border-[#FF5500] text-[#FF5500]'
                  : 'bg-[#161622] border-[#262638] text-gray-400 hover:text-white'
              }`}
            >
              🎮 {activeGame.displayName} Only
            </button>
          )}

          <div className="flex items-center bg-[#161622] border border-[#262638] rounded-lg p-0.5">
            {(['ALL', 'FREE', 'CASH'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFeeFilter(mode)}
                className={`px-3 py-1 rounded-md font-bold transition ${
                  feeFilter === mode
                    ? 'bg-[#FF5500] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {mode === 'ALL' ? 'All Stakes' : mode === 'FREE' ? 'Free (0€)' : 'Cash EUR (€)'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-[11px] font-semibold">Region:</span>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-2.5 py-1.5 bg-[#161622] border border-[#262638] text-white rounded-lg text-xs focus:outline-none focus:border-[#FF5500]"
          >
            <option value="All">Global (All Regions)</option>
            {GLOBAL_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tournaments Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-gray-400 font-mono text-sm animate-pulse">
          Loading tournament brackets...
        </div>
      ) : filteredTournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTournaments.map((t) => (
            <TournamentCard
              key={t.id}
              id={t.id}
              name={t.name}
              format={t.format}
              size={t.size}
              entryFee={t.entry_fee}
              prizePool={t.prize_pool}
              status={t.status}
              gameTitle={t.game_profiles?.display_name ?? activeGame?.displayName}
              region={t.region}
              countryCode={t.country_code}
              enrolledCount={t.enrolled_count}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-[#12121A] border border-[#1E1E2C] rounded-2xl">
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="text-lg font-bold text-white">No Tournaments Found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
            {filterGameOnly && activeGame
              ? `There are currently no tournaments open for ${activeGame.displayName}. Be the pioneer to organize one!`
              : 'There are currently no active tournaments. Launch a community bracket today!'}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {filterGameOnly && (
              <button
                onClick={() => setFilterGameOnly(false)}
                className="px-4 py-2 bg-[#1E1E2C] hover:bg-[#262638] text-white text-xs font-bold rounded-lg transition"
              >
                Show All Titles
              </button>
            )}
            <Link
              href={activeGame ? `/tournaments/new?profileId=${activeGame.id}` : '/tournaments/new'}
              className="px-5 py-2 bg-[#FF5500] hover:bg-[#FF661A] text-black text-xs font-black uppercase tracking-wider rounded-lg transition"
            >
              Organize Tournament
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
