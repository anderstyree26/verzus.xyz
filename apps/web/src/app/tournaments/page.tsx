'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { TournamentCard } from '../../components/TournamentCard';
import { apiClient } from '../../lib/api';
import { useGameStore } from '../../lib/gameStore';
import { GLOBAL_REGIONS } from '@antigravity/core';
import { OFFICIAL_GAMES } from '../../lib/gamesCatalog';
import { GamePoster } from '../../components/GamePoster';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

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
  const { activeGame, setActiveGame } = useGameStore();
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
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      {/* VX Tournament Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 sm:p-8 border border-border rounded-3xl shadow-xl">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center text-2xl font-black text-accent-400 flex-shrink-0 shadow-inner">
            🏆
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="copper">Official & Community Cups</Badge>
              {activeGame && (
                <span className="text-xs text-muted-foreground font-semibold">
                  Selected Game: <strong className="text-foreground">{activeGame.displayName}</strong>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground truncate">
              Tournaments & Championships
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Single & double elimination brackets, Swiss ladders, and national cups with guaranteed prize pools.
            </p>
          </div>
        </div>

        <Link
          href={activeGame ? `/tournaments/new?profileId=${activeGame.id}` : '/tournaments/new'}
          className="flex-shrink-0"
        >
          <Button variant="default" size="lg" className="w-full sm:w-auto">
            + Host Tournament
          </Button>
        </Link>
      </div>

      {/* FACEIT-Style Game Selector Pills */}
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
                {mode === 'ALL' ? 'All Entry' : mode === 'FREE' ? 'Free (0€)' : 'Cash EUR (€)'}
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

      {/* Tournament Cards Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-muted-foreground font-mono text-sm animate-pulse bg-card border border-border rounded-2xl">
          Fetching active championship brackets...
        </div>
      ) : filteredTournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <Card className="p-16 text-center flex flex-col items-center justify-center gap-4">
          <div className="text-4xl">🏆</div>
          <CardTitle className="text-xl">No Tournaments Found</CardTitle>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {filterGameOnly && activeGame
              ? `There are currently no active tournament brackets scheduled for ${activeGame.displayName}.`
              : 'There are currently no tournaments matching your filters.'}
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
            <Link href={activeGame ? `/tournaments/new?profileId=${activeGame.id}` : '/tournaments/new'}>
              <Button variant="default" size="default">
                Host a Cup
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
