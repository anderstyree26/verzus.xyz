'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';
import { getGameById, OFFICIAL_GAMES, type CatalogGame } from '../../../lib/gamesCatalog';
import { useGameStore } from '../../../lib/gameStore';
import { useGameAccountsStore } from '../../../lib/gameAccountsStore';
import { EloBadge } from '../../../components/EloBadge';
import { ChallengeCard } from '../../../components/ChallengeCard';
import { GamePoster } from '../../../components/GamePoster';
import { GameSelectionModal } from '../../../components/GameSelectionModal';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { formatEUR } from '../../../lib/currency';
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

interface TournamentItem {
  id: string;
  name: string;
  format: string;
  size: number;
  entry_fee: number;
  prize_pool: number;
  status: string;
  game_profiles?: { display_name: string; id?: string };
}

export default function GameHubPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { setActiveGame } = useGameStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'duels' | 'tournaments' | 'ladders'>('duels');
  const [feeFilter, setFeeFilter] = useState<'ALL' | 'FREE' | 'CASH'>('ALL');

  // Query database profiles
  const { data: profile } = useQuery<GameProfile>({
    queryKey: ['game-profile-hub', id],
    queryFn: () => apiClient<GameProfile>(`/games/${id}`),
    staleTime: 60000,
  });

  const catalogFallback = getGameById(id);
  const resolvedProfile = profile || catalogFallback;
  const catalogItem = OFFICIAL_GAMES.find((c) => c.id.toLowerCase() === resolvedProfile.id.toLowerCase()) || catalogFallback;
  const tagline = catalogItem?.tagline || 'Competitive Matchmaking Arena';

  // Gamertag handle integration
  const { getGamertag, getGamertagLabel } = useGameAccountsStore();
  const gamertagLabel = getGamertagLabel(resolvedProfile.id);
  const myGamertag = getGamertag(resolvedProfile.id);

  // 1. Fetch live open challenges for this game
  const { data: challenges, isLoading: loadingChallenges } = useQuery<ChallengeItem[]>({
    queryKey: ['hub-challenges', resolvedProfile.id],
    queryFn: async () => {
      try {
        const list = await apiClient<ChallengeItem[]>('/matches/open');
        return list.filter((c) => {
          const matchName = c.game_profiles?.display_name?.toLowerCase();
          const targetName = resolvedProfile.displayName?.toLowerCase();
          return matchName && targetName ? matchName.includes(targetName) || targetName.includes(matchName) : true;
        });
      } catch {
        return [];
      }
    },
    staleTime: 10000,
  });

  // 2. Fetch tournaments for this game
  const { data: tournaments, isLoading: loadingTournaments } = useQuery<TournamentItem[]>({
    queryKey: ['hub-tournaments', resolvedProfile.id],
    queryFn: async () => {
      try {
        const list = await apiClient<TournamentItem[]>('/tournaments');
        return list.filter((t) => {
          const tName = (t.name + ' ' + (t.game_profiles?.display_name || '')).toLowerCase();
          const targetName = resolvedProfile.displayName.toLowerCase();
          return tName.includes(targetName);
        });
      } catch {
        return [];
      }
    },
    staleTime: 15000,
  });

  // 3. Fetch leaderboard ranking for this game
  const { data: ladderEntries, isLoading: loadingLadder } = useQuery<LeaderboardEntry[]>({
    queryKey: ['hub-leaderboard', resolvedProfile.gameType],
    queryFn: () => apiClient<LeaderboardEntry[]>(`/leaderboard/${resolvedProfile.gameType}`).catch(() => []),
    staleTime: 15000,
  });

  const handleSelectAnotherGame = (game: CatalogGame) => {
    setActiveGame(game);
    router.push(`/games/${game.id}`);
  };

  const filteredChallenges = (challenges || []).filter((c) => {
    if (feeFilter === 'FREE' && (c.entry_fee || 0) > 0) return false;
    if (feeFilter === 'CASH' && (c.entry_fee || 0) === 0) return false;
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full min-w-0 pb-16">
      {/* 1. HERO ARENA BANNER (Decluttered & Clean) */}
      <Card className="relative overflow-hidden border-border bg-card shadow-2xl">
        {catalogItem.bannerUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-xs"
            style={{ backgroundImage: `url(${catalogItem.bannerUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-card/20" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <GamePoster
              game={catalogItem}
              aspect="thumb"
              className="w-16 h-22 sm:w-20 sm:h-28 rounded-2xl shadow-2xl border border-border flex-shrink-0"
            />

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="copper">OFFICIAL ARENA</Badge>
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

              <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight truncate leading-tight uppercase">
                {resolvedProfile.displayName} Arena
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                {tagline} · Automated score sync & anti-cheat active.
              </p>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap flex-shrink-0">
            <Button
              variant="outline"
              size="default"
              onClick={() => setModalOpen(true)}
              className="font-bold text-xs gap-1.5"
            >
              <span>⇄ Switch Arena</span>
            </Button>

            <Link href={`/matches/new?profileId=${resolvedProfile.id}`}>
              <Button variant="default" size="default" className="font-bold text-xs gap-1.5 shadow-md shadow-primary/20">
                <span>⚔️ Create 1v1 Duel</span>
              </Button>
            </Link>

            <Link href={`/tournaments/new?profileId=${resolvedProfile.id}`}>
              <Button variant="secondary" size="default" className="font-bold text-xs gap-1.5">
                <span>🏆 Create Cup</span>
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 2. DECLUTTERED TAB WORKSPACE: Join vs Create is Crystal Clear */}
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('duels')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'duels'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              ⚔️ Open Duels ({challenges?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tournaments')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'tournaments'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              🏆 Tournaments ({tournaments?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ladders')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'ladders'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              🥇 Ladder Rankings
            </button>
          </div>

          {activeTab === 'duels' && (
            <div className="flex items-center bg-secondary border border-border rounded-xl p-1 gap-1 text-xs">
              {(['ALL', 'FREE', 'CASH'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFeeFilter(m)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                    feeFilter === m
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m === 'ALL' ? 'All Stakes' : m === 'FREE' ? 'Free Play' : 'Cash (€)'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAB 1: DUELS */}
        {activeTab === 'duels' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base sm:text-lg text-foreground uppercase tracking-tight">
                  Available 1v1 Duels
                </h3>
                <p className="text-xs text-muted-foreground">
                  Select any open challenger to join immediately, or host your own custom match.
                </p>
              </div>

              <Link href={`/matches/new?profileId=${resolvedProfile.id}`}>
                <Button variant="default" size="sm" className="font-bold text-xs">
                  + Host Custom Match
                </Button>
              </Link>
            </div>

            {loadingChallenges ? (
              <div className="p-12 text-center text-muted-foreground font-mono text-xs animate-pulse bg-card border border-border rounded-2xl">
                Scanning open matchmaking pool for {resolvedProfile.displayName}...
              </div>
            ) : filteredChallenges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChallenges.map((c) => (
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
            ) : (
              <Card className="p-12 text-center space-y-4 bg-secondary/30">
                <span className="text-4xl block">⚔️</span>
                <div>
                  <h4 className="font-bold text-base text-foreground">No Open Duels Right Now</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Be the first competitor to open a challenge in {resolvedProfile.displayName}. Set your own stake in € EUR or play for free.
                  </p>
                </div>
                <Link href={`/matches/new?profileId=${resolvedProfile.id}`}>
                  <Button variant="default" size="default">
                    + Host First Duel
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        )}

        {/* TAB 2: TOURNAMENTS */}
        {activeTab === 'tournaments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base sm:text-lg text-foreground uppercase tracking-tight">
                  Single-Elimination Cups & Tournaments
                </h3>
                <p className="text-xs text-muted-foreground">
                  Bracket cups with automated progression and verified escrow payouts.
                </p>
              </div>

              <Link href={`/tournaments/new?profileId=${resolvedProfile.id}`}>
                <Button variant="default" size="sm" className="font-bold text-xs">
                  + Host Tournament
                </Button>
              </Link>
            </div>

            {loadingTournaments ? (
              <div className="p-12 text-center text-muted-foreground font-mono text-xs animate-pulse bg-card border border-border rounded-2xl">
                Loading tournaments...
              </div>
            ) : tournaments && tournaments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tournaments.map((t) => (
                  <Card key={t.id} className="p-5 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="copper" className="font-mono text-[9px]">
                          {t.format}
                        </Badge>
                        <Badge variant={t.status === 'ENROLLING' ? 'success' : 'secondary'} className="font-mono text-[9px]">
                          {t.status}
                        </Badge>
                      </div>

                      <h4 className="font-bold text-sm text-foreground truncate">
                        {t.name}
                      </h4>

                      <div className="text-xs font-mono text-muted-foreground space-y-0.5">
                        <p>Bracket: {t.size} Competitors</p>
                        <p>Prize: <strong className="text-emerald-400">{formatEUR(t.prize_pool)}</strong></p>
                      </div>
                    </div>

                    <Link href={`/tournaments/${t.id}`}>
                      <Button variant="default" size="sm" className="w-full font-bold text-xs">
                        Join Tournament →
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center space-y-4 bg-secondary/30">
                <span className="text-4xl block">🏆</span>
                <div>
                  <h4 className="font-bold text-base text-foreground">No Cups Scheduled Yet</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Host an 8 or 16 player knockout cup in {resolvedProfile.displayName} with guaranteed escrow rewards.
                  </p>
                </div>
                <Link href={`/tournaments/new?profileId=${resolvedProfile.id}`}>
                  <Button variant="default" size="default">
                    + Host New Cup
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        )}

        {/* TAB 3: LADDER RANKINGS */}
        {activeTab === 'ladders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base sm:text-lg text-foreground uppercase tracking-tight">
                  {resolvedProfile.displayName} Competitive Elo Standings
                </h3>
                <p className="text-xs text-muted-foreground">
                  Top verified players ranked by competitive MMR
                </p>
              </div>

              <Link href={`/leaderboards/${resolvedProfile.gameType.toLowerCase()}`}>
                <Button variant="secondary" size="sm" className="font-bold text-xs">
                  Full Ladder →
                </Button>
              </Link>
            </div>

            {loadingLadder ? (
              <div className="p-12 text-center text-muted-foreground font-mono text-xs animate-pulse bg-card border border-border rounded-2xl">
                Computing ladder rankings...
              </div>
            ) : !ladderEntries || ladderEntries.length === 0 ? (
              <Card className="p-12 text-center space-y-2 bg-secondary/30">
                <span className="text-3xl block">🥇</span>
                <p className="font-bold text-sm text-foreground">No Rated Records Yet</p>
                <p className="text-xs text-muted-foreground">Play your first verified duel in this arena to claim rank #1!</p>
              </Card>
            ) : (
              <Card className="p-4 sm:p-6 bg-card border-border shadow-md divide-y divide-border">
                {ladderEntries.slice(0, 10).map((entry, idx) => (
                  <div
                    key={entry.userId}
                    className="py-3 px-2 flex items-center justify-between gap-4 hover:bg-secondary/40 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center flex-shrink-0 ${
                        idx === 0 ? 'bg-amber-500 text-black' : idx === 1 ? 'bg-gray-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-secondary text-muted-foreground'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <Link href={`/profile/${entry.username || entry.userId}`} className="font-bold text-xs sm:text-sm text-foreground hover:text-accent-400 truncate block">
                          @{entry.username || `player_${entry.userId.slice(0, 6)}`}
                        </Link>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {entry.wins}W · {entry.losses}L
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <EloBadge elo={entry.rating} size="sm" />
                      <span className="font-mono font-bold text-xs sm:text-sm text-foreground">
                        {entry.rating} <span className="text-[10px] text-muted-foreground font-sans">ELO</span>
                      </span>
                    </div>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Global Game Selection Modal (Popup only, NEVER a top scroll list) */}
      <GameSelectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelectGame={handleSelectAnotherGame}
      />
    </div>
  );
}
