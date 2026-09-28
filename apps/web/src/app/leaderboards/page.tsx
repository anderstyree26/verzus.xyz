'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { LeaderboardTable } from '../../components/LeaderboardTable';
import { EloBadge } from '../../components/EloBadge';
import { apiClient } from '../../lib/api';
import { useGameStore } from '../../lib/gameStore';
import { OFFICIAL_GAMES, getGameById, type CatalogGame } from '../../lib/gamesCatalog';

interface LeaderboardEntry {
  userId: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  username?: string;
  countryCode?: string;
}

interface UserProfile {
  id: string;
  username: string;
  rating?: number;
}

interface UserRankResponse {
  userId: string;
  gameType: string;
  rank: number | null;
}

export default function LeaderboardsPage() {
  const { activeGame, setActiveGame } = useGameStore();
  const [selectedGameId, setSelectedGameId] = useState<string>(activeGame?.id || 'cs2');

  // Keep local selection synchronized with global active game
  useEffect(() => {
    if (activeGame?.id && activeGame.id !== selectedGameId) {
      setSelectedGameId(activeGame.id);
    }
  }, [activeGame?.id, selectedGameId]);

  const selectedGame: CatalogGame = getGameById(selectedGameId);

  const handleSelectGame = (game: CatalogGame) => {
    setSelectedGameId(game.id);
    setActiveGame(game);
  };

  // 1. Fetch logged-in user profile
  const { data: userProfile } = useQuery<UserProfile | null>({
    queryKey: ['leaderboard-user-me'],
    queryFn: async () => {
      try {
        return await apiClient<UserProfile>('/profile/me');
      } catch {
        return null;
      }
    },
    staleTime: 30000,
  });

  // 2. Fetch Leaderboard for the selected game's engine type
  const { data: entries, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', selectedGame.gameType],
    queryFn: () => apiClient<LeaderboardEntry[]>(`/leaderboard/${selectedGame.gameType}`),
    staleTime: 10000,
  });

  // 3. Fetch user's individual rank in this ladder
  const { data: userRankData } = useQuery<UserRankResponse | null>({
    queryKey: ['leaderboard-rank', selectedGame.gameType, userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return null;
      try {
        return await apiClient<UserRankResponse>(`/leaderboard/${selectedGame.gameType}/rank/${userProfile.id}`);
      } catch {
        return null;
      }
    },
    enabled: !!userProfile?.id,
    staleTime: 15000,
  });

  const userRank = userRankData?.rank;
  const userElo = userProfile?.rating ?? 1000;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* 1. Global Ladders Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111319] p-6 sm:p-8 border border-[#202430] rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#161922] border border-[#202430] flex items-center justify-center text-3xl font-black text-[#D97736] shadow-inner">
            {selectedGame.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-[#C86228]/15 text-[#D97736] border border-[#C86228]/30 text-[10px] font-bold uppercase tracking-wider rounded">
                Competitive Ranked Ladder
              </span>
              <span className="px-2 py-0.5 bg-[#161922] text-gray-400 font-mono text-[10px] rounded border border-[#202430]">
                {selectedGame.platform}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              {selectedGame.displayName} Rankings
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              {selectedGame.tagline} · Elo rating scale with Level 1 to 10 rank progression.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Link
            href={`/matches/new?profileId=${selectedGame.id}`}
            className="px-5 py-3 bg-[#C86228] hover:bg-[#D97736] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-[#C86228]/20 flex items-center gap-2"
          >
            <span>⚔️</span>
            <span>Play Ranked Duel</span>
          </Link>
          <Link
            href="/tournaments"
            className="px-4 py-3 bg-[#161922] hover:bg-[#202430] border border-[#202430] text-gray-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2"
          >
            <span>🏆</span>
            <span className="hidden sm:inline">Tournaments</span>
          </Link>
        </div>
      </div>

      {/* 2. FACEIT-Style Game Selection Tabs (THE ONLY FILTER: THE GAMES THEMSELVES) */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider px-1">
          Select Game Ladder:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {OFFICIAL_GAMES.map((game) => {
            const isSelected = game.id.toLowerCase() === selectedGameId.toLowerCase();
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => handleSelectGame(game)}
                className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border select-none ${
                  isSelected
                    ? 'bg-[#C86228] text-white border-[#C86228] shadow-md shadow-[#C86228]/20'
                    : 'bg-[#111319] hover:bg-[#161922] text-gray-400 hover:text-white border-[#202430]'
                }`}
              >
                <span className="text-sm">{game.icon}</span>
                <span>{game.displayName}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. User Personal Standing Callout (if logged in) */}
      {userProfile && (
        <div className="p-4 bg-[#111319] border border-[#202430] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <EloBadge elo={userElo} size="md" />
            <div>
              <span className="text-xs text-gray-400">Your Current Rating:</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">{userElo} Elo</span>
                {userRank ? (
                  <span className="text-xs font-bold text-[#D97736] font-mono">
                    · Ladder Position #{userRank}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 font-mono">
                    · Unranked (play your first match)
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            href={`/matches/new?profileId=${selectedGame.id}`}
            className="text-xs text-[#D97736] hover:underline font-bold flex items-center gap-1 self-start sm:self-center"
          >
            <span>Climb the {selectedGame.displayName} Ladder →</span>
          </Link>
        </div>
      )}

      {/* 4. Ranked Ladder Table */}
      {isLoading ? (
        <div className="p-12 text-center text-gray-400 font-mono text-xs bg-[#111319] border border-[#202430] rounded-2xl animate-pulse">
          Loading {selectedGame.displayName} competitive standings...
        </div>
      ) : (
        <LeaderboardTable
          entries={entries ?? []}
          gameTitle={selectedGame.displayName}
          gameIcon={selectedGame.icon}
          gameType={selectedGame.gameType}
        />
      )}
    </div>
  );
}
