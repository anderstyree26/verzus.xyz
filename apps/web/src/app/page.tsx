'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useGameStore } from '../lib/gameStore';
import { EloBadge } from '../components/EloBadge';
import { ChallengeCard } from '../components/ChallengeCard';
import { GamePoster } from '../components/GamePoster';
import { AuthPromptModal } from '../components/AuthPromptModal';
import { GameSelectionModal } from '../components/GameSelectionModal';
import { apiClient } from '../lib/api';
import { formatEUR } from '../lib/currency';
import { getGameById, OFFICIAL_GAMES } from '../lib/gamesCatalog';
import { notifyUser } from '../lib/notifications';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardContent } from '../components/ui/card';

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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [gameModalOpen, setGameModalOpen] = useState(false);

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
  const { data: userProfile, isLoading: loadingProfile } = useQuery<UserProfile | null>({
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

  // 3. Real User Match History from Database (only when authenticated)
  const { data: myMatches } = useQuery<MyMatchItem[]>({
    queryKey: ['home-my-matches'],
    queryFn: async () => {
      try {
        return await apiClient<MyMatchItem[]>('/matches/mine');
      } catch {
        return [];
      }
    },
    enabled: !!userProfile?.id,
    staleTime: 15000,
  });

  const isAuthenticated = !!userProfile?.id;

  // Calculate real performance metrics from real matches
  const settledMatches = (myMatches || []).filter((m) => m.status === 'SETTLED' || m.status === 'COMPLETED');
  const totalSettled = settledMatches.length;
  const wins = userProfile?.id
    ? settledMatches.filter((m) => m.winner_id === userProfile.id).length
    : 0;
  const losses = Math.max(0, totalSettled - wins);
  const winRate = totalSettled > 0 ? ((wins / totalSettled) * 100).toFixed(1) : '0.0';

  const recentForm = settledMatches.slice(0, 5).map((m) => {
    if (!userProfile?.id || !m.winner_id) return 'D';
    return m.winner_id === userProfile.id ? 'W' : 'L';
  });

  const elo = userProfile?.rating ?? 1000;
  const nextLevelThreshold = Math.ceil(elo / 150) * 150;
  const eloToNext = Math.max(0, nextLevelThreshold - elo);
  const eloProgressPercent = Math.min(100, Math.max(10, ((150 - eloToNext) / 150) * 100));

  const handleAcceptDuel = async (matchId: string) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    try {
      await apiClient(`/matches/${matchId}/accept`, { method: 'POST' });
      window.location.href = `/matches/${matchId}`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      notifyUser('Could not accept duel', {
        body: msg,
        sound: 'score',
        type: 'error',
      });
      refetchChallenges();
    }
  };

  const handleHostDuelClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setAuthModalOpen(true);
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
      {/* 1. If GUEST: High-Impact FACEIT-Style Hero Onboarding Banner */}
      {!isAuthenticated && !loadingProfile && (
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-2xl">
          {/* Subtle background art glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-accent-400/5 rounded-full filter blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="copper">ZERO-CONFIG ESPORTS</Badge>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  AUTOMATED BACKGROUND OCR
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px]">
                  8 OFFICIAL TITLES
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground uppercase leading-none">
                Play Competitive Duels. <br />
                <span className="text-accent-400">Win Real Prizes.</span>
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Connect your game, queue 1v1 matches or squad tournaments, and let client-side OCR verify scores in the background. No manual screenshot uploads or disputed matches.
              </p>

              <div className="flex items-center gap-3 pt-2 flex-wrap sm:flex-nowrap">
                <Link href="/signup">
                  <Button variant="default" size="lg" className="font-black text-xs uppercase tracking-wider">
                    🚀 Create Free Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" size="lg" className="font-bold text-xs uppercase tracking-wider">
                    Sign In
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setGameModalOpen(true)}
                  className="font-bold text-xs uppercase tracking-wider gap-1.5"
                >
                  <span>🕹️ Explore Arenas</span>
                </Button>
              </div>
            </div>

            {/* 3 Supported Key Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 w-full lg:w-72 flex-shrink-0">
              <div className="p-3.5 rounded-2xl bg-secondary/70 border border-border space-y-1">
                <div className="font-bold text-xs text-foreground flex items-center gap-2">
                  <span>⚡</span> Automated OCR
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Background capture validates results seamlessly. Zero player effort.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/70 border border-border space-y-1">
                <div className="font-bold text-xs text-foreground flex items-center gap-2">
                  <span>💰</span> Euro (€) Escrow
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Compete for real cash or play free with community demo points.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/70 border border-border space-y-1">
                <div className="font-bold text-xs text-foreground flex items-center gap-2">
                  <span>🥇</span> Level 1-10 ELO
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  FairPlay matchmaking calibrated to your verified skill rating.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Active Game Arena Header with Game Poster (FACEIT Hub Style) */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl">
        {/* Background banner art backdrop */}
        {catalogGame.bannerUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 filter blur-sm pointer-events-none"
            style={{ backgroundImage: `url(${catalogGame.bannerUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <GamePoster
              game={catalogGame}
              aspect="thumb"
              className="w-16 h-22 sm:w-20 sm:h-28 rounded-2xl shadow-2xl border border-border flex-shrink-0"
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

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground uppercase mt-0.5 truncate">
                {gameTitle}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {gameTagline} · Automated background score validation.
              </p>
            </div>
          </div>

          {/* Primary Action Launchers */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <Link href={`/matches/new?profileId=${gameId}`} onClick={handleHostDuelClick}>
              <Button variant="default" size="lg" className="w-full sm:w-auto font-bold">
                ⚔️ HOST 1v1 DUEL
              </Button>
            </Link>

            <Link href="/tournaments">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto font-bold">
                🏆 BROWSE CUPS
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setGameModalOpen(true)}
              className="w-full sm:w-auto font-bold gap-1.5"
            >
              <span>⇄ SWITCH ARENA</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Responsive Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Open Matches Board */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h2 className="text-base font-bold tracking-tight text-foreground uppercase truncate">
                {gameTitle} Duels & Challenges
              </h2>
            </div>
            <Link href="/challenges" className="text-xs text-accent-400 hover:underline font-bold flex-shrink-0">
              View All Open ({totalOpenCount}) →
            </Link>
          </div>

          {loadingChallenges ? (
            <div className="p-8 text-center text-muted-foreground font-mono text-xs bg-card border border-border rounded-xl animate-pulse">
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
            <div className="p-8 sm:p-10 bg-card border border-border rounded-2xl flex flex-col items-center justify-center text-center gap-4">
              <GamePoster
                game={catalogGame}
                aspect="thumb"
                className="w-16 h-22 rounded-xl shadow-lg border border-border"
              />
              <div>
                <h3 className="text-base font-bold text-foreground">No Open {gameTitle} Duels Right Now</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">
                  Be the first player to host a match in this arena. Set your stake in EUR (€) or play for free.
                </p>
              </div>
              <Link href={`/matches/new?profileId=${gameId}`} onClick={handleHostDuelClick}>
                <Button variant="default" size="default">
                  + Host Open Duel
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Real Competitor Profile or Guest Callout */}
        <div className="flex flex-col gap-4 min-w-0">
          <Card className="flex flex-col gap-4 p-4 sm:p-5">
            <CardHeader className="p-0 pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-stone-800 to-primary flex items-center justify-center font-black text-primary-foreground text-sm shadow-sm flex-shrink-0">
                    {userProfile?.username ? userProfile.username.slice(0, 1).toUpperCase() : '👤'}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-foreground truncate block">
                      {userProfile?.username ? `@${userProfile.username}` : 'Guest Competitor'}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono block">
                      {userProfile ? 'Verified Player' : 'Sign in to record stats'}
                    </span>
                  </div>
                </div>

                <EloBadge elo={elo} size="md" />
              </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col gap-4">
              {/* Elo Meter */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                  <span className="text-muted-foreground text-[11px]">
                    Rating: <strong className="text-foreground">{elo} ELO</strong>
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    Next Tier: <strong className="text-accent-400">{nextLevelThreshold}</strong>
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary border border-border rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${eloProgressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono mt-1 block text-right">
                  {eloToNext > 0 ? `${eloToNext} Elo to next level` : 'Top Level reached'}
                </span>
              </div>

              {/* Real Match Stats Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-secondary/60 border border-border rounded-xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase block">Win Rate</span>
                  <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">{winRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase block">Record</span>
                  <span className="font-mono font-bold text-foreground text-xs">
                    {wins}W - {losses}L
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase block">Matches</span>
                  <span className="font-mono font-bold text-muted-foreground text-xs">{totalSettled}</span>
                </div>
              </div>

              {/* Recent Match Form Dots */}
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-2">
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
                            ? 'bg-destructive/20 text-destructive border border-destructive/40'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {res}
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground font-mono">
                      — — — — — (No matches settled yet)
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-border flex gap-2">
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

      {/* Auth Prompt Modal (For Guests Attempting Gated Actions) */}
      <AuthPromptModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign In to Compete"
        description="To accept duels, stake entry fees, and win real cash or demo points, please create a free player account or log in."
        actionReason="Matches are verified by client-side OCR and credited to your competitive profile."
      />

      {/* Global Game Selection Modal */}
      <GameSelectionModal
        open={gameModalOpen}
        onClose={() => setGameModalOpen(false)}
      />
    </div>
  );
}
