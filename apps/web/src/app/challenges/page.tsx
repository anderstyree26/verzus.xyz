'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChallengeCard } from '../../components/ChallengeCard';
import { apiClient } from '../../lib/api';
import { useGameStore } from '../../lib/gameStore';
import { GLOBAL_REGIONS, type GlobalRegion } from '@antigravity/core';
import { OFFICIAL_GAMES, getGameById, type CatalogGame } from '../../lib/gamesCatalog';

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
  const { activeGame, setActiveGame } = useGameStore();
  const [filterGameOnly, setFilterGameOnly] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [feeFilter, setFeeFilter] = useState<'ALL' | 'FREE' | 'CASH'>('ALL');

  const { data: challenges, refetch, isLoading } = useQuery<ChallengeItem[]>({
    queryKey: ['open-challenges'],
    queryFn: async () => {
      try {
        return await apiClient<ChallengeItem[]>('/matches/open');
      } catch {
        return await apiClient<ChallengeItem[]>('/matches/mine');
      }
    },
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111319] p-6 border border-[#202430] rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#161922] border border-[#202430] flex items-center justify-center text-2xl font-black text-[#D97736]">
            ⚔️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#C86228]/15 text-[#D97736] border border-[#C86228]/30 text-[10px] font-bold uppercase tracking-wider rounded">
                Live Open Board
              </span>
              {activeGame && (
                <span className="text-xs text-gray-400 font-semibold">
                  Selected Game: <strong className="text-white">{activeGame.displayName}</strong>
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-0.5">
              Duel Matchmaking Queue
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Challenge peers in instant 1v1 duels or Party matches. All results verified by client-side OCR.
            </p>
          </div>
        </div>

        <Link
          href={activeGame ? `/matches/new?profileId=${activeGame.id}` : '/matches/new'}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C86228] hover:bg-[#D97736] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#C86228]/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Create Duel
        </Link>
      </div>

      {/* FACEIT-Style Game Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin select-none">
        <button
          type="button"
          onClick={() => setFilterGameOnly(false)}
          className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
            !filterGameOnly
              ? 'bg-[#C86228] text-white border-[#C86228] shadow-sm'
              : 'bg-[#111319] hover:bg-[#161922] text-gray-400 hover:text-white border-[#202430]'
          }`}
        >
          <span>🌐</span>
          <span>All Games</span>
        </button>

        {OFFICIAL_GAMES.map((game) => {
          const isSelected = filterGameOnly && activeGame?.id?.toLowerCase() === game.id.toLowerCase();
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => {
                setActiveGame(game);
                setFilterGameOnly(true);
              }}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                isSelected
                  ? 'bg-[#C86228] text-white border-[#C86228] shadow-md shadow-[#C86228]/20'
                  : 'bg-[#111319] hover:bg-[#161922] text-gray-400 hover:text-white border-[#202430]'
              }`}
            >
              <span>{game.icon}</span>
              <span>{game.displayName}</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#111319] border border-[#202430] rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#161922] border border-[#202430] rounded-lg p-0.5">
            {(['ALL', 'FREE', 'CASH'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFeeFilter(mode)}
                className={`px-3 py-1 rounded-md font-bold transition ${
                  feeFilter === mode
                    ? 'bg-[#C86228] text-white shadow-sm'
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
            className="px-2.5 py-1.5 bg-[#161922] border border-[#202430] text-white rounded-lg text-xs focus:outline-none focus:border-[#C86228]"
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
          Fetching live matchmaking board...
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
        <div className="p-16 text-center bg-[#111319] border border-[#202430] rounded-2xl">
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
                className="px-4 py-2 bg-[#161922] hover:bg-[#202430] border border-[#202430] text-white text-xs font-bold rounded-lg transition"
              >
                View All Games
              </button>
            )}
            <Link
              href={activeGame ? `/matches/new?profileId=${activeGame.id}` : '/matches/new'}
              className="px-5 py-2.5 bg-[#C86228] hover:bg-[#D97736] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
            >
              Post a Match
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
