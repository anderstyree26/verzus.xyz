'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useGameStore } from '../lib/gameStore';
import { EloBadge } from './EloBadge';
import { NotificationBell } from './NotificationBell';
import { apiClient } from '../lib/api';
import { formatEUR, formatPoints } from '../lib/currency';
import { useWalletModeStore } from '../lib/walletModeStore';
import { OFFICIAL_GAMES, getGameById } from '../lib/gamesCatalog';
import { GamePoster } from './GamePoster';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface HeaderWallet {
  cashEur?: number;
  balance?: number;
}

interface HeaderProfile {
  id: string;
  username: string;
  display_name?: string;
  rating?: number;
}

function getPageContext(pathname: string): { title: string; subtitle?: string } {
  if (pathname === '/') return { title: 'Overview', subtitle: 'Arena Hub' };
  if (pathname.startsWith('/challenges')) return { title: 'Duels & Wagers', subtitle: '1v1 Matchmaking' };
  if (pathname.startsWith('/tournaments')) return { title: 'Tournaments', subtitle: 'Bracket Cups' };
  if (pathname.startsWith('/leaderboards')) return { title: 'Ladders & Rank', subtitle: 'Elo Standings' };
  if (pathname.startsWith('/games')) return { title: 'Game Catalog', subtitle: 'Supported Titles' };
  if (pathname.startsWith('/matches/new')) return { title: 'Create Duel', subtitle: 'Instant Match' };
  if (pathname.startsWith('/matches/')) return { title: 'Match Room', subtitle: 'Live Contest' };
  if (pathname.startsWith('/dashboard')) return { title: 'Dashboard', subtitle: 'Wallet & Stats' };
  if (pathname.startsWith('/settings')) return { title: 'Settings', subtitle: 'Preferences' };
  if (pathname.startsWith('/admin')) return { title: 'Operations Console', subtitle: 'Admin' };
  if (pathname.startsWith('/profile')) return { title: 'Player Profile', subtitle: 'Overview' };
  return { title: 'Esports Arena', subtitle: 'Verzus' };
}

export function TopHeader() {
  const pathname = usePathname();
  const { activeGame, setActiveGame } = useGameStore();
  const { mode: walletMode, toggleMode: toggleWalletMode } = useWalletModeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gameModalOpen, setGameModalOpen] = useState(false);

  const activeCatalogGame = getGameById(activeGame?.id);
  const pageContext = getPageContext(pathname);

  // Real Wallet Balance from API
  const { data: wallet } = useQuery<HeaderWallet>({
    queryKey: ['header-wallet'],
    queryFn: async () => {
      try {
        return await apiClient<HeaderWallet>('/wallet/balance');
      } catch {
        return { cashEur: 0, balance: 0 };
      }
    },
    staleTime: 15000,
  });

  // Real User Profile from API
  const { data: me } = useQuery<HeaderProfile | null>({
    queryKey: ['header-me'],
    queryFn: async () => {
      try {
        return await apiClient<HeaderProfile>('/profile/me');
      } catch {
        return null;
      }
    },
    staleTime: 30000,
  });

  const cashAmount = wallet?.cashEur ?? 0.0;
  const pointsAmount = wallet?.balance ?? 0;
  const eloRating = me?.rating ?? 1000;
  const avatarLetter = me?.username ? me.username.slice(0, 1).toUpperCase() : 'U';

  const mobileNavLinks = [
    { href: '/', label: 'Overview', icon: '🎮' },
    { href: '/challenges', label: 'Play Duels', icon: '⚔️' },
    { href: '/tournaments', label: 'Tournaments', icon: '🏆' },
    { href: '/leaderboards', label: 'Ladders & Rank', icon: '🥇' },
    { href: '/games', label: 'Explore Games', icon: '🕹️' },
    { href: '/dashboard', label: 'Cashier & Wallet', icon: '💳' },
    { href: '/admin', label: 'Operations Admin', icon: '🛡️' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-4 sm:px-6 gap-3 sm:gap-4 max-w-full overflow-x-hidden">
      {/* 1. Left Zone: Mobile Brand + Desktop Breadcrumb Context */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
        {/* Mobile menu toggle button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition flex-shrink-0"
          aria-label="Toggle navigation drawer"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Mobile Brand Mark */}
        <Link
          href="/"
          className="lg:hidden w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-xs shadow-sm flex-shrink-0"
          title="VerzusXYZ Home"
        >
          VX
        </Link>

        {/* Desktop Breadcrumb & Arena Context */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Quick-Switch Active Arena Pill */}
          <button
            type="button"
            onClick={() => setGameModalOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-secondary/80 hover:bg-secondary border border-border hover:border-primary/50 transition group text-left min-w-0 flex-shrink"
            title="Switch Active Game Arena"
          >
            <GamePoster
              game={activeCatalogGame}
              aspect="mini"
              className="w-5 h-7 rounded flex-shrink-0"
            />
            <div className="hidden sm:flex flex-col min-w-0">
              <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider leading-none flex items-center gap-1">
                Arena <span className="text-[8px] text-accent-400">▾</span>
              </span>
              <span className="text-xs font-black text-foreground group-hover:text-accent-400 transition-colors truncate max-w-[120px] leading-tight">
                {activeCatalogGame.displayName}
              </span>
            </div>
          </button>

          <span className="hidden sm:inline text-muted-foreground/60 text-xs select-none">/</span>

          {/* Current Page Context Title */}
          <div className="hidden sm:flex flex-col text-left min-w-0">
            <span className="text-xs font-bold text-foreground tracking-tight leading-tight truncate">
              {pageContext.title}
            </span>
            {pageContext.subtitle && (
              <span className="text-[9px] text-muted-foreground font-mono leading-none">
                {pageContext.subtitle}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Center Zone: Clean Omnisearch Bar */}
      <div className="hidden xl:flex items-center flex-1 max-w-md mx-4 relative min-w-0">
        <span className="absolute left-3.5 text-muted-foreground text-xs pointer-events-none select-none">🔍</span>
        <input
          type="text"
          placeholder="Search duels, tournaments, players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-14 py-2 bg-secondary/60 hover:bg-secondary focus:bg-secondary border border-border focus:border-primary rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none transition"
        />
        <span className="absolute right-3 px-1.5 py-0.5 rounded bg-muted border border-border text-[9px] font-mono text-muted-foreground pointer-events-none select-none">
          ⌘K
        </span>
      </div>

      {/* 3. Right Zone: Unified Wallet Capsule + Notifications + Profile Chip */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Unified Wallet Capsule */}
        <div className="flex items-center bg-card border border-border hover:border-border/80 rounded-xl p-1 gap-1 transition">
          {/* Mode Switcher Button */}
          <button
            type="button"
            onClick={toggleWalletMode}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider transition ${
              walletMode === 'REAL'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25'
            }`}
            title="Click to toggle between Real Cash (€ EUR) and Free Demo Play (PTS)"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                walletMode === 'REAL' ? 'bg-emerald-400' : 'bg-purple-400 animate-pulse'
              }`}
            />
            <span>{walletMode === 'REAL' ? 'REAL' : 'DEMO'}</span>
            <span className="text-[8px] opacity-60">⇄</span>
          </button>

          {/* Active Balance Display */}
          <Link
            href="/dashboard"
            className="px-2 py-0.5 font-mono font-bold text-xs hover:text-accent-400 transition flex items-center gap-1"
            title={`Active Ledger: ${walletMode === 'REAL' ? 'Real Cash (€ EUR)' : 'Demo Play Points (PTS)'}`}
          >
            {walletMode === 'REAL' ? (
              <span className="text-emerald-400">{formatEUR(cashAmount)}</span>
            ) : (
              <span className="text-purple-300">
                {formatPoints(pointsAmount)} <span className="text-[9px] text-muted-foreground font-sans">PTS</span>
              </span>
            )}
          </Link>

          {/* Quick Deposit '+' Button */}
          <Link
            href="/dashboard"
            className="w-6 h-6 rounded-lg bg-primary hover:bg-accent-400 text-white font-black text-xs flex items-center justify-center transition shadow-sm"
            title="Deposit funds or claim demo points"
          >
            +
          </Link>
        </div>

        {/* Real-time Notification Bell */}
        <NotificationBell />

        {/* Unified Gamer Profile Chip */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 pl-1 sm:pl-1.5 pr-2.5 sm:pr-3 py-1 bg-card hover:bg-secondary border border-border hover:border-primary/50 rounded-xl transition group flex-shrink-0"
          title="Player Profile & Competitive Elo Level"
        >
          <div className="relative flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-stone-800 to-primary flex items-center justify-center font-black text-white text-xs shadow-sm">
              {avatarLetter}
            </div>
            {/* Embedded Mini Elo Level Badge Pip */}
            <div className="absolute -bottom-1 -right-1">
              <EloBadge elo={eloRating} size="sm" />
            </div>
          </div>
          <div className="hidden sm:flex flex-col text-left leading-none">
            <span className="text-xs font-bold text-foreground group-hover:text-accent-400 transition-colors truncate max-w-[85px]">
              {me?.username ? `@${me.username}` : 'Gamer'}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground mt-0.5">
              {eloRating} <span className="text-muted-foreground/60 font-sans text-[7px] uppercase">ELO</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-4 lg:hidden shadow-2xl z-50 max-h-[85vh] overflow-y-auto">
          {/* Mobile Search */}
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search duels, tournaments, players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-secondary border border-border rounded-xl text-xs text-foreground focus:outline-none"
            />
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider px-1">Navigation</span>
            {mobileNavLinks.map((tab) => {
              const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Arena Switcher with Posters */}
          <div className="border-t border-border pt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Switch Arena</span>
              <span className="text-[10px] text-accent-400 font-mono">{activeCatalogGame.displayName}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {OFFICIAL_GAMES.map((g) => {
                const isSelected = activeCatalogGame.id.toLowerCase() === g.id.toLowerCase();
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setActiveGame(g);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold flex items-center gap-2 text-left border transition ${
                      isSelected
                        ? 'bg-primary/20 text-foreground border-primary'
                        : 'bg-secondary text-muted-foreground border-border'
                    }`}
                  >
                    <GamePoster
                      game={g}
                      aspect="mini"
                      className="w-5 h-7 rounded flex-shrink-0"
                    />
                    <span className="truncate">{g.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 overflow-y-auto pr-1 scrollbar-thin max-h-[60vh]">
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
                    className={`relative rounded-xl overflow-hidden border text-left transition-all duration-200 group aspect-[3/4] flex flex-col justify-between p-2.5 ${
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
                      <span className="text-[9px] text-gray-300 font-mono block mt-0.5">
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
    </header>
  );
}
