'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Check,
  Gamepad2,
  Plus,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useGameStore } from '../lib/gameStore';
import { OFFICIAL_GAMES, getGameById, type CatalogGame } from '../lib/gamesCatalog';
import { GamePoster } from './GamePoster';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface GameDropdownProps {
  open: boolean;
  onClose: () => void;
}

export function GameDropdown({ open, onClose }: GameDropdownProps) {
  const { activeGame, setActiveGame } = useGameStore();
  const [filter, setFilter] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click or escape
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const filteredGames = OFFICIAL_GAMES.filter((g) =>
    g.displayName.toLowerCase().includes(filter.toLowerCase()) ||
    g.shortName.toLowerCase().includes(filter.toLowerCase()) ||
    g.platform.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSelectGame = (game: CatalogGame) => {
    setActiveGame(game);
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      role="menu"
      aria-label="Select Game Arena"
      className="absolute left-0 top-full mt-2 z-50 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[480px]"
    >
      {/* Dropdown Header & Quick Filter */}
      <div className="p-3 border-b border-border bg-muted/40 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Select Game Arena
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            {OFFICIAL_GAMES.length} Official Arenas
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground pointer-events-none" />
          <Input
            autoFocus
            type="text"
            placeholder="Filter games..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 pl-8 pr-3 text-xs bg-background border-border"
          />
        </div>
      </div>

      {/* Games List */}
      <div className="overflow-y-auto p-1.5 space-y-1 divide-y divide-border/30 scrollbar-thin">
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => {
            const isSelected = activeGame?.id === game.id;

            return (
              <button
                key={game.id}
                type="button"
                role="menuitem"
                onClick={() => handleSelectGame(game)}
                className={`w-full p-2 rounded-lg text-left transition flex items-center justify-between group ${
                  isSelected
                    ? 'bg-primary/10 border border-primary/30 text-foreground'
                    : 'hover:bg-muted/70 text-foreground'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <GamePoster
                    game={game}
                    aspect="thumb"
                    className="w-9 h-12 rounded-md flex-shrink-0 shadow-sm border border-border"
                  />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs truncate text-foreground group-hover:text-primary transition-colors">
                        {game.displayName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">
                        {game.platform}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {game.tagline}
                      </span>
                    </div>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-muted-foreground group-hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    Play →
                  </span>
                )}
              </button>
            );
          })
        ) : (
          <div className="p-6 text-center space-y-2">
            <p className="text-xs text-muted-foreground">No games match &ldquo;{filter}&rdquo;</p>
            <Link
              href="/games/new"
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Request this title
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-2 border-t border-border bg-muted/30 flex items-center justify-between text-xs">
        <Link
          href="/games"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground text-[11px] font-medium flex items-center gap-1 transition"
        >
          <span>All Games Catalog</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
        <Link
          href="/games/new"
          onClick={onClose}
          className="text-primary hover:text-primary/80 text-[11px] font-bold flex items-center gap-1 transition"
        >
          <Plus className="w-3 h-3" />
          <span>Add Custom Game</span>
        </Link>
      </div>
    </div>
  );
}
