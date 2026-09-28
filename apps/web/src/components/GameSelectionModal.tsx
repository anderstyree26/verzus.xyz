'use client';

import { useState } from 'react';
import { OFFICIAL_GAMES, type CatalogGame } from '../lib/gamesCatalog';
import { useGameStore } from '../lib/gameStore';
import { GamePoster } from './GamePoster';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface GameSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectGame?: (game: CatalogGame) => void;
}

export function GameSelectionModal({
  open,
  onClose,
  onSelectGame,
}: GameSelectionModalProps) {
  const { activeGame, setActiveGame } = useGameStore();
  const [search, setSearch] = useState('');

  if (!open) return null;

  const filteredGames = OFFICIAL_GAMES.filter((g) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      g.displayName.toLowerCase().includes(q) ||
      g.shortName.toLowerCase().includes(q) ||
      g.gameType.toLowerCase().includes(q) ||
      g.platform.toLowerCase().includes(q)
    );
  });

  const handlePick = (game: CatalogGame) => {
    setActiveGame(game);
    if (onSelectGame) {
      onSelectGame(game);
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-3xl bg-card border border-border rounded-3xl shadow-2xl p-6 text-foreground flex flex-col gap-4 max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h3 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-tight">
                Select Esports Arena
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pick your title to filter open duels, tournaments, squads, and ladders.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground flex items-center justify-center text-sm font-bold transition flex-shrink-0"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-muted-foreground text-xs pointer-events-none">🔍</span>
          <input
            type="text"
            placeholder="Search game titles, platforms, genres..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-secondary/70 focus:bg-secondary border border-border focus:border-primary rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none transition"
            autoFocus
          />
        </div>

        {/* 3:4 Vertical Game Poster Grid (FACEIT Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 overflow-y-auto pr-1 scrollbar-thin max-h-[58vh]">
          {filteredGames.map((g) => {
            const isSelected = activeGame?.id?.toLowerCase() === g.id.toLowerCase();

            return (
              <button
                key={g.id}
                type="button"
                onClick={() => handlePick(g)}
                className={`group relative rounded-2xl overflow-hidden border text-left transition-all duration-200 aspect-[3/4] flex flex-col justify-between p-3.5 ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/40 shadow-xl scale-[1.02]'
                    : 'border-border hover:border-primary/60 hover:scale-[1.01]'
                }`}
              >
                <GamePoster
                  game={g}
                  aspect="poster"
                  showOverlay
                  className="absolute inset-0 w-full h-full"
                />

                {/* Top badges */}
                <div className="relative z-10 flex items-center justify-between w-full">
                  <Badge variant="secondary" className="backdrop-blur-md bg-background/80 text-[9px] font-mono border-border">
                    {g.platform}
                  </Badge>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-black tracking-wider uppercase shadow-md">
                      ACTIVE ✓
                    </span>
                  )}
                </div>

                {/* Bottom title & genre */}
                <div className="relative z-10">
                  <span className="font-black text-xs sm:text-sm text-white block leading-tight group-hover:text-accent-400 transition-colors drop-shadow-md truncate">
                    {g.displayName}
                  </span>
                  <span className="text-[10px] text-gray-300 font-mono block mt-1 uppercase tracking-wider">
                    {g.gameType.replace('_', ' ')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-mono text-[11px]">
            {OFFICIAL_GAMES.length} Official Arenas Supported
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
