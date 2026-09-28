'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useGameStore } from '../lib/gameStore';
import { apiClient } from '../lib/api';
import type { GameProfile } from '@antigravity/core';
import { OFFICIAL_GAMES, getGameById, type CatalogGame } from '../lib/gamesCatalog';
import { GamePoster } from './GamePoster';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';

export function GameRail() {
  const pathname = usePathname();
  const { activeGame, setActiveGame, initializeDefaultGame } = useGameStore();
  const [gameModalOpen, setGameModalOpen] = useState(false);

  const { data: games } = useQuery<GameProfile[]>({
    queryKey: ['approved-games-rail'],
    queryFn: () => apiClient<GameProfile[]>('/games'),
  });

  useEffect(() => {
    if (games && games.length > 0) {
      initializeDefaultGame(games);
    }
  }, [games, initializeDefaultGame]);

  const activeCatalogGame = getGameById(activeGame?.id);

  // Top 3 pinned games for quick switching
  const pinnedGames = OFFICIAL_GAMES.slice(0, 3);

  const navItems = [
    { href: '/challenges', label: 'Play Duels', icon: '⚔️', match: '/challenges' },
    { href: '/tournaments', label: 'Tournaments', icon: '🏆', match: '/tournaments' },
    { href: '/leaderboards', label: 'Ladders & Rank', icon: '🥇', match: '/leaderboards' },
    { href: '/games', label: 'Explore Games', icon: '🕹️', match: '/games' },
  ];

  return (
    <>
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-background border-r border-border flex-col justify-between p-4 select-none h-screen sticky top-0 overflow-y-auto scrollbar-none z-30 pb-24 space-y-6">
        <div className="space-y-6">
          {/* Brand Logo & Name */}
          <Link
            href="/"
            className="flex items-center gap-3 px-2 py-1 text-foreground hover:opacity-90 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-black text-primary-foreground text-base shadow-sm transition-transform group-hover:scale-105">
              VX
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base tracking-tight text-foreground leading-tight">VERZUS</span>
              <span className="text-[10px] font-mono text-accent-400 uppercase tracking-wider leading-none">Esports Arena</span>
            </div>
          </Link>

          {/* Active Game Card with Poster Thumbnail */}
          <Card className="p-3 bg-card border-border space-y-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono tracking-wider px-1">
              Active Arena
            </span>
            <button
              type="button"
              onClick={() => setGameModalOpen(true)}
              className="flex items-center justify-between p-2 rounded-xl bg-secondary/80 hover:bg-secondary border border-border hover:border-primary/50 transition group text-left w-full"
              title="Click to switch game"
            >
              <div className="flex items-center gap-3 min-w-0">
                <GamePoster
                  game={activeCatalogGame}
                  aspect="thumb"
                  className="w-10 h-14 rounded-lg flex-shrink-0 shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-foreground truncate block group-hover:text-accent-400 transition-colors">
                    {activeCatalogGame.displayName}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono block mt-1">
                    {activeCatalogGame.platform} · {activeCatalogGame.shortName}
                  </span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-accent-400 flex-shrink-0 ml-1">⇄</span>
            </button>
          </Card>

          {/* Primary Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono tracking-wider px-3 mb-2 block">
              Arena Navigation
            </span>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.match);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <span className="text-base select-none">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <Separator />

          {/* Pinned Favorite Games with Mini Posters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono tracking-wider">
                Favorites
              </span>
              <button
                type="button"
                onClick={() => setGameModalOpen(true)}
                className="text-xs text-accent-400 hover:underline font-bold"
              >
                All ({OFFICIAL_GAMES.length})
              </button>
            </div>

            <div className="space-y-1">
              {pinnedGames.map((game) => {
                const isSelected = activeCatalogGame.id.toLowerCase() === game.id.toLowerCase();
                return (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => setActiveGame(game)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition border text-left w-full ${
                      isSelected
                        ? 'bg-secondary border-primary text-foreground font-bold'
                        : 'bg-transparent hover:bg-secondary border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <GamePoster
                        game={game}
                        aspect="mini"
                        className="w-5 h-7 rounded flex-shrink-0"
                      />
                      <span className="truncate text-xs">{game.displayName}</span>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Utility Links */}
        <div className="pt-3 border-t border-border flex items-center justify-between px-3 text-xs">
          <Link
            href="/admin"
            className={`flex items-center gap-1.5 transition ${
              pathname.startsWith('/admin') ? 'text-accent-400 font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>🛡️</span>
            <span>Admin</span>
          </Link>
          <Link
            href="/settings"
            className={`flex items-center gap-1.5 transition ${
              pathname.startsWith('/settings') ? 'text-accent-400 font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>⚙️</span>
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* FACEIT-Style Game Poster Selection Modal */}
      {gameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl p-6 text-foreground flex flex-col gap-4 max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">Select Esports Arena</h3>
                <p className="text-xs text-muted-foreground">
                  Switching titles filters duels, tournaments, and rankings to your selected game.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGameModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Poster Cards Grid (FACEIT Style) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 overflow-y-auto pr-1 scrollbar-thin max-h-[60vh]">
              {OFFICIAL_GAMES.map((g) => {
                const isSelected = activeCatalogGame.id.toLowerCase() === g.id.toLowerCase();
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setActiveGame(g);
                      setGameModalOpen(false);
                    }}
                    className={`relative rounded-xl overflow-hidden border text-left transition-all duration-200 group aspect-[3/4] flex flex-col justify-between p-3 ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/40 shadow-lg'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <GamePoster
                      game={g}
                      aspect="poster"
                      showOverlay
                      className="absolute inset-0 w-full h-full"
                    />

                    <div className="relative z-10 flex items-center justify-between w-full">
                      <Badge variant="secondary" className="backdrop-blur-md bg-background/70 text-[9px] font-mono">
                        {g.platform}
                      </Badge>
                      {isSelected && (
                        <span className="px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[9px] font-black">
                          ACTIVE ✓
                        </span>
                      )}
                    </div>

                    <div className="relative z-10">
                      <span className="font-bold text-xs text-white block leading-tight group-hover:text-accent-400 transition-colors truncate">
                        {g.displayName}
                      </span>
                      <span className="text-[10px] text-gray-300 font-mono block mt-0.5">
                        {g.gameType.replace('_', ' ')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <Link
                href="/games"
                onClick={() => setGameModalOpen(false)}
                className="text-accent-400 hover:underline font-bold"
              >
                View Full Game Catalog →
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setGameModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
