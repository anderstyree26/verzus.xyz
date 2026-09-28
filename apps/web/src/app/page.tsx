'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useGameStore } from '../lib/gameStore';
import { EloBadge } from '../components/EloBadge';
import { ChallengeCard } from '../components/ChallengeCard';
import { GamePoster } from '../components/GamePoster';
import { apiClient } from '../lib/api';
import { formatEUR } from '../lib/currency';
import { getGameById } from '../lib/gamesCatalog';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

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

interface MyMatchItem {
  id: string;
  winner_id?: string | null;
  status: string;
  entry_fee?: number;
  created_at: string;
}

interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  rating?: number;
  region?: string;
}

export default function HomePage() {
  const { activeGame } = useGameStore();

  const catalogGame = getGameById(activeGame?.id);
  const gameTitle = catalogGame.displayName;
  const gamePlatform = catalogGame.platform;
  const gameId = catalogGame.id;
  const gameTagline = catalogGame.tagline;

  // 1. Real Open Challenges from Database
  const { data: openChallenges, refetch: refetchChallenges, isLoading: loadingChallenges } = useQuery<ChallengeItem[]>({
    queryKey: ['home-open-challenges'],
    queryFn: async () => {
      try {
        return await apiClient<ChallengeItem[]>('/matches/open');
      } catch {
        return [];
      }
    },
    staleTime: 10000,
  });

  // 2. Real User Profile from Database
  const { data: userProfile } = useQuery<UserProfile | null>({
    queryKey: ['home-user-profile'],
    queryFn: async () => {
      try {
        return await apiClient<UserProfile>('/profile/me');
      } catch {
        return null;
      }
    },
    staleTime: 30000,
  });

  // 3. Real User Match History from Database
  const { data: myMatches } = useQuery<MyMatchItem[]>({
    queryKey: ['home-my-matches'],
    queryFn: async () => {
      try {
        return await apiClient<MyMatchItem[]>('/matches/mine');
      } catch {
        return [];
      }
    },
    staleTime: 15000,
  });

  // Calculate real performance metrics from real matches
  const settledMatches = (myMatches || []).filter((m) => m.status === 'SETTLED' || m.status === 'COMPLETED');
  const totalSettled = settledMatches.length;
  const wins = userProfile?.id
    ? settledMatches.filter((m) => m.winner_id === userProfile.id).length
    : 0;
  const losses = Math.max(0, totalSettled - wins);
  const winRate = totalSettled > 0 ? ((wins / totalSettled) * 100).toFixed(1) : '0.0';

  // Real recent 5 match outcomes
  const recentForm = settledMatches.slice(0, 5).map((m) => {
    if (!userProfile?.id || !m.winner_id) return 'D';
    return m.winner_id === userProfile.id ? 'W' : 'L';
  });

  const elo = userProfile?.rating ?? 1000;
  const nextLevelThreshold = Math.ceil(elo / 150) * 150;
  const eloToNext = Math.max(0, nextLevelThreshold - elo);
  const eloProgressPercent = Math.min(100, Math.max(10, ((150 - eloToNext) / 150) * 100));

  const handleAcceptDuel = async (matchId: string) => {
    try {
      await apiClient(`/matches/${matchId}/accept`, { method: 'POST' });
      window.location.href = `/matches/${matchId}`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Could not accept duel: ${msg}`);
      refetchChallenges();
    }
  };

  // Filter open challenges strictly by the active game title
  const activeChallenges = (openChallenges || []).filter((c) => {
    const matchName = c.game_profiles?.display_name?.toLowerCase();
    const activeName = gameTitle.toLowerCase();
    if (matchName && activeName) {
      return matchName.includes(activeName) || activeName.includes(matchName);
    }
    return true;
  });

  const totalOpenCount = openChallenges?.length ?? 0;
  const activeOpenCount = activeChallenges.length;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto min-w-0">
      {/* 1. Clean, Spacious Active Game Arena Header with Game Poster */}
      <div className="relative overflow-hidden rounded-3xl border border-[#202430] bg-[#111319] p-6 sm:p-8 shadow-2xl">
        {/* Background banner art backdrop */}
        {catalogGame.bannerUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 filter blur-sm pointer-events-none"
            style={{ backgroundImage: `url(${catalogGame.bannerUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C10] via-[#0B0C10]/90 to-[#0B0C10]/60 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <GamePoster
              game={catalogGame}
              aspect="thumb"
              className="w-16 h-22 sm:w-20 sm:h-28 rounded-2xl shadow-2xl border border-[#202430] flex-shrink-0"
            />
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="copper">Official Arena</Badge>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${activeOpenCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
                  {activeOpenCount > 0 ? `${activeOpenCount} DUELS READY` : 'READY TO PLAY'}
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {gamePlatform}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase mt-0.5 truncate">
                {gameTitle}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                {gameTagline} · Automated background score validation.
              </p>
            </div>
          </div>

          {/* Primary Action Launchers */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <Link href={`/matches/new?profileId=${gameId}`}>
              <Button variant="default" size="lg" className="w-full sm:w-auto">
                ⚔️ HOST 1v1 DUEL
              </Button>
            </Link>

            <Link href="/tournaments">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                🏆 BROWSE CUPS
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Responsive Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Open Matches Board */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C86228]" />
              <h2 className="text-base font-bold tracking-tight text-white uppercase truncate">
                {gameTitle} Duels & Challenges
              </h2>
            </div>
            <Link href="/challenges" className="text-xs text-[#D97736] hover:underline font-bold flex-shrink-0">
              View All Open ({totalOpenCount}) →
            </Link>
          </div>

          {loadingChallenges ? (
            <div className="p-8 text-center text-gray-500 font-mono text-xs bg-[#111319] border border-[#202430] rounded-xl animate-pulse">
              Querying open matchmaking pool...
            </div>
          ) : activeChallenges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeChallenges.slice(0, 4).map((c) => (
                <ChallengeCard
                  key={c.id}
                  id={c.id}
                  gameTitle={c.game_profiles?.display_name || gameTitle}
                  gameType={c.game_profiles?.game_type || catalogGame.gameType}
                  entryFee={c.entry_fee ?? 0}
                  prizePool={c.prize_pool ?? 0}
                  creatorName={c.created_by?.slice(0, 8) || 'Player'}
                  format={c.format || 'BO1'}
                  countryCode={c.country_code}
                  mode={c.mode || '1v1'}
                  onAccept={() => handleAcceptDuel(c.id)}
                />
              ))}
            </div>
          ) : (
            /* Clean Empty State with Game Poster */
            <div className="p-8 sm:p-10 bg-[#111319] border border-[#202430] rounded-2xl flex flex-col items-center justify-center text-center gap-4">
              <GamePoster
                game={catalogGame}
                aspect="thumb"
                className="w-16 h-22 rounded-xl shadow-lg border border-[#202430]"
              />
              <div>
                <h3 className="text-base font-bold text-white">No Open {gameTitle} Duels Right Now</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-md">
                  Be the first player to host a match in this arena. Set your stake in EUR (€) or play for free.
                </p>
              </div>
              <Link href={`/matches/new?profileId=${gameId}`}>
                <Button variant="default" size="default">
                  + Host Open Duel
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Real Competitor Profile Card */}
        <div className="flex flex-col gap-4 min-w-0">
          <Card className="flex flex-col gap-4">
            <CardHeader className="pb-3 border-b border-[#202430]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-stone-800 to-[#C86228] flex items-center justify-center font-black text-white text-sm shadow-sm flex-shrink-0">
                    {userProfile?.username ? userProfile.username.slice(0, 1).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-white truncate block">
                      {userProfile?.username ? `@${userProfile.username}` : 'Guest Competitor'}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono block">
                      {userProfile ? 'Verified Player' : 'Sign in to record stats'}
                    </span>
                  </div>
                </div>

                <EloBadge elo={elo} size="md" />
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {/* Elo Meter */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                  <span className="text-gray-400 text-[11px]">
                    Rating: <strong className="text-white">{elo} ELO</strong>
                  </span>
                  <span className="text-gray-500 text-[11px]">
                    Next Tier: <strong className="text-[#D97736]">{nextLevelThreshold}</strong>
                  </span>
                </div>
                <div className="w-full h-2 bg-[#0B0C10] border border-[#202430] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-[#C86228] rounded-full transition-all duration-500"
                    style={{ width: `${eloProgressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 font-mono mt-1 block text-right">
                  {eloToNext > 0 ? `${eloToNext} Elo to next level` : 'Top Level reached'}
                </span>
              </div>

              {/* Real Match Stats Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-[#0B0C10] border border-[#202430] rounded-xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Win Rate</span>
                  <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">{winRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Record</span>
                  <span className="font-mono font-bold text-white text-xs">
                    {wins}W - {losses}L
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Matches</span>
                  <span className="font-mono font-bold text-gray-300 text-xs">{totalSettled}</span>
                </div>
              </div>

              {/* Recent Match Form Dots */}
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-2">
                  Recent Match Form
                </span>
                <div className="flex items-center gap-1.5">
                  {recentForm.length > 0 ? (
                    recentForm.map((res, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] font-mono ${
                          res === 'W'
                            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                            : res === 'L'
                            ? 'bg-red-600/20 text-red-400 border border-red-500/40'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {res}
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 font-mono">
                      — — — — — (No matches settled yet)
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-[#202430] flex gap-2">
                <Link href="/challenges" className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">
                    Find Duels
                  </Button>
                </Link>
                <Link href="/leaderboards" className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">
                    View Ladders
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
