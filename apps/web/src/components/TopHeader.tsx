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

import { OFFICIAL_GAMES, getGameById, type CatalogGame } from '../lib/gamesCatalog';

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

export function TopHeader() {
  const pathname = usePathname();
  const { activeGame, setActiveGame } = useGameStore();
  const { mode: walletMode, toggleMode: toggleWalletMode } = useWalletModeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gameModalOpen, setGameModalOpen] = useState(false);

  const activeCatalogGame = getGameById(activeGame?.id);

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

  const navTabs = [
    { href: '/', label: 'Overview', icon: '🎮', exact: true },
    { href: '/challenges', label: 'Play VS', icon: '⚔️' },
    { href: '/tournaments', label: 'Tournaments', icon: '🏆' },
    { href: '/leaderboards', label: 'Ladders', icon: '🥇' },
    { href: '/games', label: 'All Games', icon: '🕹️' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0B0C10]/95 backdrop-blur-md border-b border-[#202430] h-16 flex items-center justify-between px-3 sm:px-6 gap-3">
      {/* Left: Brand mark (on mobile) + Active Game Title & Navigation Tabs */}
      <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto scrollbar-none">
        {/* Mobile brand icon (since GameRail is desktop-only) */}
        <Link
          href="/"
          className="lg:hidden w-8 h-8 rounded-lg bg-[#C86228] text-white flex items-center justify-center font-black text-xs shadow-sm flex-shrink-0"
          title="VerzusXYZ Home"
        >
          VX
        </Link>

        {/* Active Game Badge - Clickable to switch games */}
        <button
          type="button"
          onClick={() => setGameModalOpen(true)}
          className="flex items-center gap-2 flex-shrink-0 p-1 rounded-xl hover:bg-[#161922] transition text-left group"
          title="Click to switch active game"
        >
          <div className="w-8 h-8 rounded-lg bg-[#161922] group-hover:bg-[#202430] border border-[#202430] flex items-center justify-center text-sm font-black text-[#D97736]">
            {activeCatalogGame.icon}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider leading-none flex items-center gap-1">
              Active Arena <span className="text-[8px] text-[#D97736]">▼</span>
            </span>
            <span className="text-xs sm:text-sm font-black text-white tracking-tight leading-tight truncate max-w-[120px] sm:max-w-[200px] group-hover:text-[#D97736] transition-colors">
              {activeCatalogGame.displayName}
            </span>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navTabs.map((tab) => {
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#C86228] text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#161922]'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Center: Search Bar (Desktop) */}
      <div className="hidden xl:flex items-center flex-1 max-w-xs relative">
        <span className="absolute left-3 text-gray-500 text-xs">🔍</span>
        <input
          type="text"
          placeholder="Search players, cups, hubs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 bg-[#111319] border border-[#202430] focus:border-[#C86228] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition"
        />
      </div>

      {/* Right: Level 1-10 Elo Badge, EUR Wallet & Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        {/* Real VX Elo Level Badge Widget */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-[#111319] hover:bg-[#161922] border border-[#202430] rounded-xl transition"
          title="Competitive Skill Rating"
        >
          <EloBadge elo={eloRating} size="sm" />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[9px] text-gray-400 font-mono leading-none">VX ELO</span>
            <span className="text-xs font-black text-white font-mono leading-tight">{eloRating}</span>
          </div>
        </Link>

        {/* Mode Indicator & Switcher (REAL CASH vs DEMO PLAY) */}
        <button
          type="button"
          onClick={toggleWalletMode}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition border ${
            walletMode === 'REAL'
              ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
              : 'bg-purple-500/15 border-purple-500/40 text-purple-300 hover:bg-purple-500/25'
          }`}
          title="Click to toggle between Real Cash (€ EUR) and Free Demo Play (PTS)"
        >
          <span className={`w-2 h-2 rounded-full ${walletMode === 'REAL' ? 'bg-green-400' : 'bg-purple-400 animate-pulse'}`} />
          <span className="font-mono tracking-wider">{walletMode === 'REAL' ? 'REAL CASH' : 'DEMO PLAY'}</span>
          <span className="text-[9px] text-gray-500">⇄</span>
        </button>

        {/* Active Ledger Balance */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-[#111319] hover:bg-[#161922] border border-[#202430] rounded-xl text-xs transition"
          title={`Active Wallet: ${walletMode === 'REAL' ? 'Real Cash (€ EUR)' : 'Demo Play Points (PTS)'}`}
        >
          {walletMode === 'REAL' ? (
            <span className="font-mono font-bold text-green-400">{formatEUR(cashAmount)}</span>
          ) : (
            <span className="font-mono font-bold text-purple-300">{formatPoints(pointsAmount)} PTS</span>
          )}
          <span className="w-4 h-4 rounded-full bg-[#C86228] text-white font-bold text-[10px] flex items-center justify-center">
            +
          </span>
        </Link>

        <NotificationBell />

        {/* User Profile Avatar */}
        <Link
          href="/dashboard"
          className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-800 to-[#C86228] flex items-center justify-center font-black text-white text-xs shadow-sm hover:scale-105 transition-transform"
          title={me?.username ? `@${me.username}` : 'Gamer Profile'}
        >
          {avatarLetter}
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#0B0C10] border-b border-[#202430] p-4 flex flex-col gap-3 md:hidden shadow-2xl z-50">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Navigation</span>
            {navTabs.map((tab) => {
              const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                    isActive ? 'bg-[#C86228] text-white' : 'text-gray-300 hover:bg-[#161922]'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-[#202430] pt-2 flex flex-col gap-1.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Title:</span>
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
                    className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 text-left border ${
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

      {/* Game Selection Modal */}
      {gameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#111319] border border-[#202430] rounded-2xl shadow-2xl p-6 text-white flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#202430] pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Select Game Arena</h3>
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
