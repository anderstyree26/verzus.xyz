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
import { GamePoster } from '../../../components/GamePoster';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
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
  const catalogItem = OFFICIAL_GAMES.find((c) => c.id.toLowerCase() === resolvedProfile.id.toLowerCase()) || catalogFallback;
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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto min-w-0">
      {/* 1. Quick-Switch to Other Most Played Games with Mini Posters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin select-none max-w-full">
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
              className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                isCurrent
                  ? 'bg-[#C86228] text-white border-[#C86228] shadow-md shadow-[#C86228]/20'
                  : 'bg-[#111319] hover:bg-[#161922] text-gray-400 hover:text-white border-[#202430]'
              }`}
            >
              <GamePoster
                game={g}
                aspect="mini"
                className="w-4 h-6 rounded flex-shrink-0"
              />
              <span className="truncate">{g.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Official Game Hub Hero Banner (FACEIT Style with Poster Cover) */}
      <div className="relative rounded-3xl overflow-hidden border border-[#202430] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111319] shadow-2xl">
        {/* Subtle background poster art backdrop */}
        {catalogItem.bannerUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 filter blur-sm pointer-events-none"
            style={{ backgroundImage: `url(${catalogItem.bannerUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C10] via-[#0B0C10]/90 to-[#0B0C10]/60 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4 sm:gap-6 min-w-0">
          <GamePoster
            game={catalogItem}
            aspect="thumb"
            className="w-16 h-22 sm:w-20 sm:h-28 rounded-2xl shadow-2xl border border-[#202430] flex-shrink-0"
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="copper">Official Arena</Badge>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {resolvedProfile.platform || 'UNIVERSAL'}
              </Badge>
              {myGamertag ? (
                <Badge variant="success" className="font-mono text-[10px]">
                  {gamertagLabel}: {myGamertag}
                </Badge>
              ) : (
                <Badge variant="warning" className="font-mono text-[10px]">
                  ⚠️ {gamertagLabel} Not Linked
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight truncate">
              {resolvedProfile.displayName} Hub
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
              {tagline} · Automated background score validation and anti-cheat tracking.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
          <Link
            href={`/matches/new?profileId=${resolvedProfile.id}`}
            onClick={() => setActiveGame(resolvedProfile)}
          >
            <Button variant="default" size="lg">
              ⚔️ Host Duel
            </Button>
          </Link>
          <Link
            href={`/tournaments/new?profileId=${resolvedProfile.id}`}
            onClick={() => setActiveGame(resolvedProfile)}
          >
            <Button variant="secondary" size="lg">
              🏆 Host Cup
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. Primary Choices (Progressive Disclosure) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Choice A: 1v1 & Squad Duels */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚔️</span>
              <div>
                <CardTitle>Duel Matchmaking</CardTitle>
                <p className="text-xs text-gray-400 mt-0.5">Head-to-head cash duels and free practice matches</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-xs text-gray-300">
              <div className="flex items-center justify-between p-2.5 bg-[#0B0C10] rounded-xl border border-[#202430]">
                <span className="text-gray-400 font-mono">Series Options:</span>
                <span className="font-bold text-white">BO1, BO3, BO5</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#0B0C10] rounded-xl border border-[#202430]">
                <span className="text-gray-400 font-mono">Stake Modes:</span>
                <span className="font-bold text-[#D97736]">Real Cash (€ EUR) & Free Play</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="flex gap-2">
              <Link
                href={`/matches/new?profileId=${resolvedProfile.id}`}
                onClick={() => setActiveGame(resolvedProfile)}
                className="flex-1"
              >
                <Button variant="default" size="default" className="w-full">
                  + Create Match
                </Button>
              </Link>
              <Link
                href={`/challenges?gameId=${resolvedProfile.id}`}
                className="flex-1"
              >
                <Button variant="secondary" size="default" className="w-full">
                  Browse Open ({challenges?.length || 0})
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Choice B: Tournaments & Cups */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div>
                <CardTitle>Bracket Tournaments</CardTitle>
                <p className="text-xs text-gray-400 mt-0.5">Single-elimination knockout cups with automated brackets</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-xs text-gray-300">
              <div className="flex items-center justify-between p-2.5 bg-[#0B0C10] rounded-xl border border-[#202430]">
                <span className="text-gray-400 font-mono">Bracket Sizes:</span>
                <span className="font-bold text-white">4, 8, 16, 32 Players</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#0B0C10] rounded-xl border border-[#202430]">
                <span className="text-gray-400 font-mono">Prize Pool:</span>
                <span className="font-bold text-emerald-400">Guaranteed Escrow Payouts</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="flex gap-2">
              <Link
                href={`/tournaments/new?profileId=${resolvedProfile.id}`}
                onClick={() => setActiveGame(resolvedProfile)}
                className="flex-1"
              >
                <Button variant="default" size="default" className="w-full">
                  + Create Cup
                </Button>
              </Link>
              <Link
                href={`/tournaments?gameId=${resolvedProfile.id}`}
                className="flex-1"
              >
                <Button variant="secondary" size="default" className="w-full">
                  View Cups
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Same-Page Context: Open Duels & Ranking Standings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Open Duels for this game */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>⚔️</span>
                <span>Open Duels in {resolvedProfile.displayName}</span>
              </h2>
              <p className="text-xs text-gray-400">Join instantly or stake real funds against online challengers</p>
            </div>

            <Link
              href={`/matches/new?profileId=${resolvedProfile.id}`}
              onClick={() => setActiveGame(resolvedProfile)}
            >
              <Button variant="default" size="sm">
                + New Duel
              </Button>
            </Link>
          </div>

          {loadingChallenges ? (
            <div className="p-8 text-center text-gray-400 font-mono text-xs bg-[#111319] border border-[#202430] rounded-2xl animate-pulse">
              Fetching open duels...
            </div>
          ) : !challenges || challenges.length === 0 ? (
            <div className="p-8 text-center bg-[#111319] border border-[#202430] rounded-2xl flex flex-col items-center justify-center gap-3">
              <span className="text-3xl opacity-50">🕹️</span>
              <p className="text-sm font-bold text-white">No active open duels right now</p>
              <p className="text-xs text-gray-400 max-w-sm">
                Be the first to post a match challenge in {resolvedProfile.displayName} and set your own stake amount.
              </p>
              <Link
                href={`/matches/new?profileId=${resolvedProfile.id}`}
                onClick={() => setActiveGame(resolvedProfile)}
              >
                <Button variant="default" size="sm">
                  Create First Duel
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {challenges.map((c) => (
                <ChallengeCard
                  key={c.id}
                  id={c.id}
                  gameTitle={c.game_profiles?.display_name || resolvedProfile.displayName}
                  gameType={c.game_profiles?.game_type || resolvedProfile.gameType}
                  entryFee={c.entry_fee ?? 0}
                  prizePool={c.prize_pool ?? 0}
                  creatorName={c.created_by ? c.created_by.slice(0, 8) : 'Challenger'}
                  format={c.format}
                  countryCode={c.country_code}
                  mode={c.mode}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Live Competitive Ladder Standings */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>🥇</span>
                <span>Ladder Ranking</span>
              </h2>
              <p className="text-xs text-gray-400">Top rated players</p>
            </div>

            <Link
              href={`/leaderboards/${resolvedProfile.gameType.toLowerCase()}`}
              className="text-xs text-[#D97736] hover:underline font-bold"
            >
              Full Ladder →
            </Link>
          </div>

          <div className="bg-[#111319] border border-[#202430] rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
            {loadingLadder ? (
              <div className="p-6 text-center text-gray-400 font-mono text-xs animate-pulse">
                Loading standings...
              </div>
            ) : !ladderEntries || ladderEntries.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-xs">
                No rated match records yet for {resolvedProfile.displayName}. Play your first duel to claim #1 rank!
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {(ladderEntries || []).slice(0, 5).map((entry, idx) => (
                  <div
                    key={entry.userId}
                    className="flex items-center justify-between p-2.5 bg-[#0B0C10] border border-[#202430] rounded-xl text-xs hover:border-[#C86228]/40 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded font-black text-[10px] flex items-center justify-center ${
                        idx === 0 ? 'bg-amber-500 text-black' : idx === 1 ? 'bg-gray-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-[#161922] text-gray-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-white block">
                          @{entry.username || `player_${entry.userId.slice(0, 6)}`}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {entry.wins}W / {entry.losses}L
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <EloBadge elo={entry.rating} size="sm" />
                      <span className="font-mono font-bold text-white">{entry.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
