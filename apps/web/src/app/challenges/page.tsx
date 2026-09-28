'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChallengeCard } from '../../components/ChallengeCard';
import { apiClient } from '../../lib/api';
import { useGameStore } from '../../lib/gameStore';
import { GLOBAL_REGIONS } from '@antigravity/core';
import { OFFICIAL_GAMES } from '../../lib/gamesCatalog';
import { GamePoster } from '../../components/GamePoster';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

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
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 sm:p-8 border border-border rounded-3xl shadow-xl">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center text-2xl font-black text-accent-400 flex-shrink-0 shadow-inner">
            ⚔️
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="copper">Live Open Board</Badge>
              {activeGame && (
                <span className="text-xs text-muted-foreground font-semibold">
                  Selected Game: <strong className="text-foreground">{activeGame.displayName}</strong>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground truncate">
              Duel Matchmaking Queue
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Challenge peers in instant 1v1 duels or Party matches. All results verified by client-side OCR.
            </p>
          </div>
        </div>

        <Link
          href={activeGame ? `/matches/new?profileId=${activeGame.id}` : '/matches/new'}
          className="flex-shrink-0"
        >
          <Button variant="default" size="lg" className="w-full sm:w-auto">
            + Create Duel
          </Button>
        </Link>
      </div>

      {/* FACEIT-Style Game Selector Pills with Mini Posters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin select-none max-w-full">
        <button
          type="button"
          onClick={() => setFilterGameOnly(false)}
          className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
            !filterGameOnly
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-card hover:bg-secondary text-muted-foreground hover:text-foreground border-border'
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
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                  : 'bg-card hover:bg-secondary text-muted-foreground hover:text-foreground border-border'
              }`}
            >
              <GamePoster
                game={game}
                aspect="mini"
                className="w-4 h-6 rounded flex-shrink-0"
              />
              <span className="truncate">{game.displayName}</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-card border border-border rounded-2xl text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary border border-border rounded-xl p-1 gap-1">
            {(['ALL', 'FREE', 'CASH'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFeeFilter(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  feeFilter === mode
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode === 'ALL' ? 'All Stakes' : mode === 'FREE' ? 'Free (0€)' : 'Cash EUR (€)'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-semibold">Region:</span>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 bg-secondary border border-border text-foreground rounded-xl text-xs focus:outline-none focus:border-primary"
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

      {/* Challenge Grid with consistent gap-6 */}
      {isLoading ? (
        <div className="p-16 text-center text-muted-foreground font-mono text-sm animate-pulse bg-card border border-border rounded-2xl">
          Fetching live matchmaking board...
        </div>
      ) : filteredChallenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <Card className="p-16 text-center flex flex-col items-center justify-center gap-4">
          <div className="text-4xl">⚔️</div>
          <CardTitle className="text-xl">No Open Duels in this Queue</CardTitle>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {filterGameOnly && activeGame
              ? `There are currently no active duels posted for ${activeGame.displayName}. Be the first to create one!`
              : 'There are currently no open duels waiting. Host a match now to challenge opponents!'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            {filterGameOnly && (
              <Button
                variant="secondary"
                size="default"
                onClick={() => setFilterGameOnly(false)}
              >
                View All Games
              </Button>
            )}
            <Link href={activeGame ? `/matches/new?profileId=${activeGame.id}` : '/matches/new'}>
              <Button variant="default" size="default">
                Post a Match
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
