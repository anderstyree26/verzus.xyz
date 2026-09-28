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
    <header className="sticky top-0 z-30 bg-[#0B0C10]/95 backdrop-blur-md border-b border-[#202430] h-16 flex items-center justify-between px-3 sm:px-6 gap-3">
      {/* 1. Left Zone: Mobile Brand + Desktop Breadcrumb Context */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Mobile menu toggle button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#161922] transition"
          aria-label="Toggle navigation drawer"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Mobile Brand Mark */}
        <Link
          href="/"
          className="lg:hidden w-8 h-8 rounded-lg bg-[#C86228] text-white flex items-center justify-center font-black text-xs shadow-sm flex-shrink-0"
          title="VerzusXYZ Home"
        >
          VX
        </Link>

        {/* Desktop Breadcrumb & Arena Context */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick-Switch Active Arena Pill */}
          <button
            type="button"
            onClick={() => setGameModalOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#111319] hover:bg-[#161922] border border-[#202430] hover:border-[#C86228]/50 transition group text-left"
            title="Switch Active Game Arena"
          >
            <span className="text-base select-none">{activeCatalogGame.icon}</span>
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider leading-none flex items-center gap-1">
                Arena <span className="text-[8px] text-[#D97736]">▾</span>
              </span>
              <span className="text-xs font-black text-white group-hover:text-[#D97736] transition-colors truncate max-w-[130px] leading-tight">
                {activeCatalogGame.displayName}
              </span>
            </div>
          </button>

          <span className="hidden sm:inline text-gray-600 text-xs select-none">/</span>

          {/* Current Page Context Title */}
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-white tracking-tight leading-tight">
              {pageContext.title}
            </span>
            {pageContext.subtitle && (
              <span className="text-[10px] text-gray-400 font-mono leading-none">
                {pageContext.subtitle}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Center Zone: Clean Omnisearch Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-2 lg:mx-6 relative">
        <span className="absolute left-3.5 text-gray-500 text-xs pointer-events-none select-none">🔍</span>
        <input
          type="text"
          placeholder="Search duels, tournaments, players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-14 py-2 bg-[#111319] hover:bg-[#141720] focus:bg-[#161922] border border-[#202430] focus:border-[#C86228] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition shadow-inner"
        />
        <span className="absolute right-3 px-1.5 py-0.5 rounded bg-[#1A1D27] border border-[#262B38] text-[9px] font-mono text-gray-400 pointer-events-none select-none">
          ⌘K
        </span>
      </div>

      {/* 3. Right Zone: Unified Wallet Capsule + Notifications + Profile Chip */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        {/* Unified Wallet Capsule (Mode + Balance + Top Up) */}
        <div className="flex items-center bg-[#111319] border border-[#202430] hover:border-[#2A2E3D] rounded-xl p-1 gap-1 transition">
          {/* Mode Switcher Button */}
          <button
            type="button"
            onClick={toggleWalletMode}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider transition ${
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
            <span className="text-[9px] opacity-60">⇄</span>
          </button>

          {/* Active Balance Display */}
          <Link
            href="/dashboard"
            className="px-2 py-0.5 font-mono font-bold text-xs hover:text-[#D97736] transition flex items-center gap-1"
            title={`Active Ledger: ${walletMode === 'REAL' ? 'Real Cash (€ EUR)' : 'Demo Play Points (PTS)'}`}
          >
            {walletMode === 'REAL' ? (
              <span className="text-emerald-400">{formatEUR(cashAmount)}</span>
            ) : (
              <span className="text-purple-300">
                {formatPoints(pointsAmount)} <span className="text-[9px] text-gray-400 font-sans">PTS</span>
              </span>
            )}
          </Link>

          {/* Quick Deposit '+' Button */}
          <Link
            href="/dashboard"
            className="w-6 h-6 rounded-lg bg-[#C86228] hover:bg-[#D97736] text-white font-black text-xs flex items-center justify-center transition shadow-sm"
            title="Deposit funds or claim demo points"
          >
            +
          </Link>
        </div>

        {/* Real-time Notification Bell */}
        <NotificationBell />

        {/* Unified Gamer Profile Chip (Avatar + Embedded Elo Level Pip + Gamertag) */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 pl-1 sm:pl-1.5 pr-2 sm:pr-3 py-1 bg-[#111319] hover:bg-[#161922] border border-[#202430] hover:border-[#C86228]/50 rounded-xl transition group flex-shrink-0"
          title="Player Profile & Competitive Elo Level"
        >
          <div className="relative flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-stone-800 to-[#C86228] flex items-center justify-center font-black text-white text-xs shadow-sm">
              {avatarLetter}
            </div>
            {/* Embedded Mini Elo Level Badge Pip */}
            <div className="absolute -bottom-1 -right-1">
              <EloBadge elo={eloRating} size="sm" />
            </div>
          </div>
          <div className="hidden sm:flex flex-col text-left leading-none">
            <span className="text-xs font-bold text-white group-hover:text-[#D97736] transition-colors truncate max-w-[85px]">
              {me?.username ? `@${me.username}` : 'Gamer'}
            </span>
            <span className="text-[10px] font-mono text-gray-400 mt-0.5">
              {eloRating} <span className="text-gray-500 font-sans text-[8px] uppercase">ELO</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Mobile Drawer (Responsive overlay when GameRail is hidden) */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#0B0C10] border-b border-[#202430] p-4 flex flex-col gap-4 lg:hidden shadow-2xl z-50">
          {/* Mobile Search */}
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search duels, tournaments, players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-[#111319] border border-[#202430] rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-1">Navigation</span>
            {mobileNavLinks.map((tab) => {
              const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition ${
                    isActive ? 'bg-[#C86228] text-white' : 'text-gray-300 hover:bg-[#161922]'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Arena Switcher */}
          <div className="border-t border-[#202430] pt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Switch Arena</span>
              <span className="text-[10px] text-[#D97736] font-mono">{activeCatalogGame.displayName}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
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
                        ? 'bg-[#C86228] text-white border-[#C86228]'
                        : 'bg-[#161922] text-gray-300 border-[#202430]'
                    }`}
                  >
                    <span>{g.icon}</span>
                    <span className="truncate">{g.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Game Selection Modal (Quick switch modal for desktop & mobile) */}
      {gameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#111319] border border-[#202430] rounded-2xl shadow-2xl p-6 text-white flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#202430] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Select Game Arena</h3>
                <p className="text-xs text-gray-400">
                  Switching titles filters duels, tournaments, and rankings to your selected game.
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

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
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
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
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
                      <span className="text-[#D97736] font-extrabold text-xs">SELECTED ✓</span>
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
    </header>
  );
}
