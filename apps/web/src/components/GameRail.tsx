'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useGameStore } from '../lib/gameStore';
import { apiClient } from '../lib/api';
import type { GameProfile } from '@antigravity/core';
import { OFFICIAL_GAMES, getGameById, type CatalogGame } from '../lib/gamesCatalog';

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

  // Top 3 pinned games for quick switching (decluttered - not all 8+ games in an endless column)
  const pinnedGames = OFFICIAL_GAMES.slice(0, 3);

  const navItems = [
    { href: '/challenges', label: 'Play Duels', icon: '⚔️', match: '/challenges' },
    { href: '/tournaments', label: 'Tournaments', icon: '🏆', match: '/tournaments' },
    { href: '/leaderboards', label: 'Ladders & Rank', icon: '🥇', match: '/leaderboards' },
    { href: '/games', label: 'Explore Games', icon: '🕹️', match: '/games' },
  ];

  return (
    <>
      <aside className="hidden lg:flex w-60 flex-shrink-0 bg-[#0B0C10] border-r border-[#202430] flex-col justify-between py-4 px-3.5 z-40 select-none">
        <div className="flex flex-col gap-5">
          {/* Brand Logo & Name */}
          <Link
            href="/"
            className="flex items-center gap-2.5 px-2 py-1 text-white hover:opacity-90 transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C86228] group-hover:bg-[#D97736] flex items-center justify-center font-black text-white text-base shadow-sm transition-transform group-hover:scale-105">
              VX
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base tracking-tight text-white leading-tight">VERZUS</span>
              <span className="text-[9px] font-mono text-[#D97736] uppercase tracking-wider leading-none">Esports Arena</span>
            </div>
          </Link>

          {/* Active Game Card with Quick-Switch Modal Trigger */}
          <div className="p-3 bg-[#111319] border border-[#202430] rounded-xl flex flex-col gap-2 shadow-sm">
            <span className="text-[9px] uppercase font-bold text-gray-500 font-mono tracking-wider">
              Selected Arena
            </span>
            <button
              type="button"
              onClick={() => setGameModalOpen(true)}
              className="flex items-center justify-between p-2 rounded-lg bg-[#161922] hover:bg-[#202430] border border-[#202430] hover:border-[#C86228]/50 transition group text-left"
              title="Click to switch game"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl select-none flex-shrink-0">{activeCatalogGame.icon}</span>
                <div className="min-w-0">
                  <span className="text-xs font-black text-white truncate block group-hover:text-[#D97736] transition-colors">
                    {activeCatalogGame.displayName}
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono block">
                    {activeCatalogGame.platform} · {activeCatalogGame.shortName}
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-500 group-hover:text-[#D97736] flex-shrink-0 ml-1">⇄</span>
            </button>
          </div>

          {/* Primary Navigation Links */}
          <nav className="flex flex-col gap-1">
            <span className="text-[9px] uppercase font-bold text-gray-500 font-mono tracking-wider px-2 mb-1">
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
                      ? 'bg-[#C86228] text-white shadow-md shadow-[#C86228]/20'
                      : 'text-gray-400 hover:text-white hover:bg-[#161922]'
                  }`}
                >
                  <span className="text-base select-none">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="h-px bg-[#202430] my-1" />

          {/* Pinned Favorite Games (Compact - 3 games max, not 15) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-2">
              <span className="text-[9px] uppercase font-bold text-gray-500 font-mono tracking-wider">
                Favorites
              </span>
              <button
                type="button"
                onClick={() => setGameModalOpen(true)}
                className="text-[10px] text-[#D97736] hover:underline font-bold"
              >
                All (8)
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {pinnedGames.map((game) => {
                const isSelected = activeCatalogGame.id.toLowerCase() === game.id.toLowerCase();
                return (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => setActiveGame(game)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition border text-left ${
                      isSelected
                        ? 'bg-[#161922] border-[#C86228] text-white font-bold'
                        : 'bg-[#0B0C10] hover:bg-[#161922] border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm select-none">{game.icon}</span>
                      <span className="truncate">{game.displayName}</span>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C86228]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Utility Links */}
        <div className="pt-3 border-t border-[#202430] flex items-center justify-between px-2 text-xs">
          <Link
            href="/admin"
            className={`flex items-center gap-1.5 transition ${
              pathname.startsWith('/admin') ? 'text-[#D97736] font-bold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span>🛡️</span>
            <span>Admin</span>
          </Link>
          <Link
            href="/settings"
            className={`flex items-center gap-1.5 transition ${
              pathname.startsWith('/settings') ? 'text-[#D97736] font-bold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span>⚙️</span>
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Game Selection Modal (when clicking switch game) */}
      {gameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#111319] border border-[#202430] rounded-2xl shadow-2xl p-6 text-white flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#202430] pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Switch Esports Arena</h3>
                <p className="text-xs text-gray-400">
                  Select a title to pivot duels, tournaments, and rankings to that game.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGameModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1 custom-scroll">
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
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-[#C86228]/15 border-[#C86228] text-white shadow'
                        : 'bg-[#161922] border-[#202430] hover:border-gray-500 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{g.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{g.displayName}</span>
                          <span className="px-1.5 py-0.5 bg-[#C86228]/20 text-[#D97736] text-[9px] font-bold rounded">
                            {g.platform}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{g.tagline}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="text-[#D97736] font-extrabold text-xs">ACTIVE ✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#202430] flex items-center justify-between text-xs">
              <Link
                href="/games"
                onClick={() => setGameModalOpen(false)}
                className="text-[#D97736] hover:underline font-bold"
              >
                View Full Game Catalog →
              </Link>
              <button
                type="button"
                onClick={() => setGameModalOpen(false)}
                className="px-4 py-2 bg-[#161922] hover:bg-[#202430] border border-[#202430] rounded-lg text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
