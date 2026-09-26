'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChallengeCard } from '../../components/ChallengeCard';
import { apiClient } from '../../lib/api';
import { useGameStore } from '../../lib/gameStore';
import { GLOBAL_REGIONS, type GlobalRegion } from '@antigravity/core';

interface ChallengeItem {
  id: string;
  game_profiles?: { display_name: string; game_type: string; id?: string };
  profile_id?: string;
  entry_fee?: number;
  prize_pool?: number;
  created_by?: string;
  format?: string;
  country_code?: string;
  mode?: string;
}

export default function ChallengesPage() {
  const { activeGame } = useGameStore();
  const [filterGameOnly, setFilterGameOnly] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [feeFilter, setFeeFilter] = useState<'ALL' | 'FREE' | 'CASH'>('ALL');

  const { data: challenges, refetch, isLoading } = useQuery<ChallengeItem[]>({
    queryKey: ['open-challenges'],
    queryFn: () => apiClient<ChallengeItem[]>('/matches/mine'), // matches list
  });

  const handleAccept = async (matchId: string) => {
    try {
      await apiClient(`/matches/${matchId}/accept`, { method: 'POST' });
      alert('VS Duel Accepted! Redirecting to Matchroom...');
      window.location.href = `/matches/${matchId}`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Could not accept: ${msg}`);
      refetch();
    }
  };

  // Filter items by active game, region, and fee
  const filteredChallenges = (challenges || []).filter((c) => {
    if (filterGameOnly && activeGame) {
      const matchName = c.game_profiles?.display_name?.toLowerCase();
      const activeName = activeGame.displayName?.toLowerCase();
      if (matchName && activeName && !matchName.includes(activeName) && !activeName.includes(matchName)) {
        return false;
      }
    }

    if (feeFilter === 'FREE' && (c.entry_fee || 0) > 0) return false;
    if (feeFilter === 'CASH' && (c.entry_fee || 0) === 0) return false;

    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#12121A] p-6 border border-[#1E1E2C] rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#1E1E2C] border border-[#262638] flex items-center justify-center text-2xl font-black text-[#FF5500]">
            VS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#FF5500]/15 text-[#FF5500] text-[10px] font-black uppercase tracking-wider rounded">
                Live Open Board
              </span>
              {activeGame && (
                <span className="text-xs text-gray-400 font-semibold">
                  Selected Game: <strong className="text-white">{activeGame.displayName}</strong>
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-0.5">
              VS Play Queue & Duels
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Challenge peers in instant 1v1 duels or Party matches. All results verified by client-side OCR.
            </p>
          </div>
        </div>

        <Link
          href={activeGame ? `/matches/new?profileId=${activeGame.id}` : '/matches/new'}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF5500] hover:bg-[#FF661A] text-black font-extrabold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#FF5500]/25"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Create VS Match
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

      {/* Challenge Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-gray-400 font-mono text-sm animate-pulse">
          Fetching live VS board...
        </div>
      ) : filteredChallenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredChallenges.map((c) => (
            <ChallengeCard
              key={c.id}
              id={c.id}
              gameTitle={c.game_profiles?.display_name ?? activeGame?.displayName ?? 'Competitive Match'}
              gameType={c.game_profiles?.game_type ?? activeGame?.gameType ?? 'HIGH_SCORE'}
              entryFee={c.entry_fee ?? 0}
              prizePool={c.prize_pool ?? 0}
              creatorName={c.created_by?.slice(0, 8) ?? 'player'}
              format={c.format ?? 'BO1'}
              countryCode={c.country_code}
              mode={c.mode ?? '1v1'}
              onAccept={() => handleAccept(c.id)}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-[#12121A] border border-[#1E1E2C] rounded-2xl">
          <div className="text-3xl mb-2">⚔️</div>
          <h3 className="text-lg font-bold text-white">No Open Duels in this Queue</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
            {filterGameOnly && activeGame
              ? `There are currently no active duels posted for ${activeGame.displayName}. Be the first to create one!`
              : 'There are currently no open duels waiting. Host a match now to challenge opponents!'}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {filterGameOnly && (
              <button
                onClick={() => setFilterGameOnly(false)}
                className="px-4 py-2 bg-[#1E1E2C] hover:bg-[#262638] text-white text-xs font-bold rounded-lg transition"
              >
                View All Games
              </button>
            )}
            <Link
              href={activeGame ? `/matches/new?profileId=${activeGame.id}` : '/matches/new'}
              className="px-5 py-2 bg-[#FF5500] hover:bg-[#FF661A] text-black text-xs font-black uppercase tracking-wider rounded-lg transition"
            >
              Post a VS Match
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
