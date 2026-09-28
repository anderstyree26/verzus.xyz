'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';
import { getGameById, OFFICIAL_GAMES, type CatalogGame } from '../../../lib/gamesCatalog';
import { useGameStore } from '../../../lib/gameStore';
import { useGameAccountsStore } from '../../../lib/gameAccountsStore';
import { EloBadge } from '../../../components/EloBadge';
import { ChallengeCard } from '../../../components/ChallengeCard';
import { LeaderboardTable } from '../../../components/LeaderboardTable';
import type { GameProfile } from '@antigravity/core';

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

interface LeaderboardEntry {
  userId: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  username?: string;
  countryCode?: string;
}

export default function GameHubPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { setActiveGame } = useGameStore();

  const { data: profile } = useQuery<GameProfile | null>({
    queryKey: ['game-profile-detail', id],
    queryFn: () => apiClient<GameProfile>(`/games/${id}`).catch(() => null),
  });

  const catalogFallback = getGameById(id);
  const resolvedProfile = profile || catalogFallback;
  const catalogItem = OFFICIAL_GAMES.find((c) => c.id.toLowerCase() === resolvedProfile.id.toLowerCase());
  const icon = catalogItem?.icon || '🎮';
  const tagline = catalogItem?.tagline || 'Competitive Matchmaking Arena';

  // Gamertag handle integration
  const { getGamertag, getGamertagLabel, setGamertag } = useGameAccountsStore();
  const gamertagLabel = getGamertagLabel(resolvedProfile.id);
  const myGamertag = getGamertag(resolvedProfile.id);

  // 1. Fetch live open challenges for this specific game
  const { data: challenges, isLoading: loadingChallenges } = useQuery<ChallengeItem[]>({
    queryKey: ['hub-challenges', resolvedProfile.id],
    queryFn: async () => {
      try {
        const list = await apiClient<ChallengeItem[]>('/matches/open');
        return list.filter((c) => {
          const matchName = c.game_profiles?.display_name?.toLowerCase();
          const targetName = resolvedProfile.displayName?.toLowerCase();
          return matchName && targetName ? matchName.includes(targetName) : true;
        });
      } catch {
        return [];
      }
    },
    staleTime: 10000,
  });

  // 2. Fetch leaderboard ranking preview for this game
  const { data: ladderEntries, isLoading: loadingLadder } = useQuery<LeaderboardEntry[]>({
    queryKey: ['hub-leaderboard', resolvedProfile.gameType],
    queryFn: () => apiClient<LeaderboardEntry[]>(`/leaderboard/${resolvedProfile.gameType}`).catch(() => []),
    staleTime: 15000,
  });

  const handleSelectAnotherGame = (game: CatalogGame) => {
    setActiveGame(game);
    router.push(`/games/${game.id}`);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* 1. Quick-Switch to Other Most Played Games */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin select-none">
        <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider flex-shrink-0 mr-1">
          Quick Switch:
        </span>
        {OFFICIAL_GAMES.map((g) => {
          const isCurrent = g.id.toLowerCase() === resolvedProfile.id.toLowerCase();
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => handleSelectAnotherGame(g)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                isCurrent
                  ? 'bg-[#C86228] text-white border-[#C86228] shadow-md shadow-[#C86228]/20'
                  : 'bg-[#111319] hover:bg-[#161922] text-gray-400 hover:text-white border-[#202430]'
              }`}
            >
              <span>{g.icon}</span>
              <span>{g.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Official Game Hub Banner */}
      <div className="bg-[#111319] border border-[#202430] p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#161922] border border-[#202430] flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-[#C86228]/15 text-[#D97736] border border-[#C86228]/30 text-[10px] font-bold uppercase rounded">
                Official Arena
              </span>
              <span className="px-2 py-0.5 bg-[#161922] text-gray-400 font-mono text-[10px] rounded border border-[#202430]">
                {resolvedProfile.platform || 'UNIVERSAL'}
              </span>
              {myGamertag ? (
                <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-[10px] rounded">
                  {gamertagLabel}: <strong>{myGamertag}</strong>
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 font-mono text-[10px] rounded">
                  ⚠️ {gamertagLabel} Not Linked
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1 text-white">
              {resolvedProfile.displayName} Hub
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              {tagline} · Client-side automated anti-cheat score validation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/matches/new?profileId=${resolvedProfile.id}`}
            onClick={() => setActiveGame(resolvedProfile)}
            className="px-6 py-3 bg-[#C86228] hover:bg-[#D97736] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-[#C86228]/20 flex items-center gap-2"
          >
            <span>⚔️</span>
            <span>Host Duel</span>
          </Link>
          <Link
            href={`/tournaments/new?profileId=${resolvedProfile.id}`}
            onClick={() => setActiveGame(resolvedProfile)}
            className="px-5 py-3 bg-[#161922] hover:bg-[#202430] border border-[#202430] text-gray-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2"
          >
            <span>🏆</span>
            <span>Host Cup</span>
          </Link>
        </div>
      </div>

      {/* 3. Primary Choices First (FACEIT-Style Progressive Disclosure) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Choice A: 1v1 & Squad Duels */}
        <div className="p-6 bg-[#111319] border border-[#202430] rounded-2xl flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚔️</span>
              <div>
                <h3 className="text-lg font-bold text-white">Duel Matchmaking</h3>
                <p className="text-xs text-gray-400">Head-to-head cash duels and free practice matches</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-xs text-gray-300">
              <div className="flex items-center justify-between p-2.5 bg-[#0B0C10] rounded-lg border border-[#202430]">
                <span>Series Options:</span>
                <span className="font-bold text-white">BO1, BO3, BO5</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#0B0C10] rounded-lg border border-[#202430]">
                <span>Stake Modes:</span>
                <span className="font-bold text-[#D97736]">Real Cash (€ EUR) & Free Play</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/matches/new?profileId=${resolvedProfile.id}`}
              onClick={() => setActiveGame(resolvedProfile)}
              className="flex-1 py-2.5 bg-[#C86228] hover:bg-[#D97736] text-white font-bold text-xs uppercase rounded-xl transition text-center shadow-sm"
            >
              + Create Match
            </Link>
            <Link
              href="/challenges"
              onClick={() => setActiveGame(resolvedProfile)}
              className="px-4 py-2.5 bg-[#161922] hover:bg-[#202430] border border-[#202430] text-gray-300 hover:text-white font-bold text-xs uppercase rounded-xl transition text-center"
            >
              Browse Open Board
            </Link>
          </div>
        </div>

        {/* Choice B: Tournaments & Cups */}
        <div className="p-6 bg-[#111319] border border-[#202430] rounded-2xl flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div>
                <h3 className="text-lg font-bold text-white">Tournaments & Championships</h3>
                <p className="text-xs text-gray-400">Single & Double Elimination brackets, Swiss cups</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-xs text-gray-300">
              <div className="flex items-center justify-between p-2.5 bg-[#0B0C10] rounded-lg border border-[#202430]">
                <span>Bracket Formats:</span>
                <span className="font-bold text-white">Single Elim, Double, Swiss, Round Robin</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#0B0C10] rounded-lg border border-[#202430]">
                <span>Bracket Sizes:</span>
                <span className="font-bold text-white">4 to 64 Entrants</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/tournaments"
              onClick={() => setActiveGame(resolvedProfile)}
              className="flex-1 py-2.5 bg-[#161922] hover:bg-[#202430] border border-[#202430] text-gray-200 hover:text-white font-bold text-xs uppercase rounded-xl transition text-center"
            >
              View Active Cups
            </Link>
            <Link
              href={`/tournaments/new?profileId=${resolvedProfile.id}`}
              onClick={() => setActiveGame(resolvedProfile)}
              className="px-4 py-2.5 bg-[#161922] hover:bg-[#202430] border border-[#202430] text-gray-300 hover:text-white font-bold text-xs uppercase rounded-xl transition text-center"
            >
              + Organize Cup
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Live Open Matches for this Game */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C86228]" />
            <h3 className="text-base font-bold text-white">
              Open {resolvedProfile.displayName} Duels
            </h3>
          </div>
          <Link href="/challenges" className="text-xs text-[#D97736] hover:underline font-bold">
            View All Open Matches →
          </Link>
        </div>

        {loadingChallenges ? (
          <div className="p-8 text-center text-gray-500 font-mono text-xs bg-[#111319] border border-[#202430] rounded-xl">
            Querying open matchmaking pool...
          </div>
        ) : challenges && challenges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.slice(0, 3).map((c) => (
              <ChallengeCard
                key={c.id}
                id={c.id}
                gameTitle={c.game_profiles?.display_name || resolvedProfile.displayName}
                gameType={c.game_profiles?.game_type || resolvedProfile.gameType}
                entryFee={c.entry_fee ?? 0}
                prizePool={c.prize_pool ?? 0}
                creatorName={c.created_by?.slice(0, 8) || 'Player'}
                format={c.format || 'BO1'}
                countryCode={c.country_code}
                mode={c.mode || '1v1'}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-[#111319] border border-[#202430] rounded-xl text-center flex flex-col items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <span className="text-sm font-bold text-white">No open duels waiting for {resolvedProfile.displayName}</span>
            <p className="text-xs text-gray-400">Be the first to post a duel and set your stake!</p>
            <Link
              href={`/matches/new?profileId=${resolvedProfile.id}`}
              className="mt-2 px-5 py-2 bg-[#C86228] hover:bg-[#D97736] text-white font-bold text-xs uppercase rounded-lg transition"
            >
              Post Open Duel
            </Link>
          </div>
        )}
      </div>

      {/* 5. Same Page Rankings & Ladder Preview */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C86228]" />
            <h3 className="text-base font-bold text-white">
              {resolvedProfile.displayName} Ranked Ladder
            </h3>
          </div>
          <Link href={`/leaderboards/${resolvedProfile.id}`} className="text-xs text-[#D97736] hover:underline font-bold">
            Full Leaderboard →
          </Link>
        </div>

        {loadingLadder ? (
          <div className="p-8 text-center text-gray-500 font-mono text-xs bg-[#111319] border border-[#202430] rounded-xl">
            Loading rankings...
          </div>
        ) : (
          <LeaderboardTable
            entries={(ladderEntries || []).slice(0, 5)}
            gameTitle={resolvedProfile.displayName}
            gameIcon={icon}
            gameType={resolvedProfile.gameType}
          />
        )}
      </div>
    </div>
  );
}
