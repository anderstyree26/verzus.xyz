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
  const { activeGame } = useGameStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        {/* Active Game Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#161922] border border-[#202430] flex items-center justify-center text-sm font-black text-[#D97736]">
            ⚡
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider leading-none">
              Active Arena
            </span>
            <span className="text-xs sm:text-sm font-black text-white tracking-tight leading-tight truncate max-w-[120px] sm:max-w-[200px]">
              {activeGame?.displayName || 'Select Game'}
            </span>
          </div>
        </div>

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

        {/* Real Dual-Ledger EUR Wallet */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-[#111319] hover:bg-[#161922] border border-[#202430] rounded-xl text-xs transition"
          title="Wallet: EUR Cash & Points"
        >
          <span className="font-mono font-bold text-green-400">{formatEUR(cashAmount)}</span>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <span className="font-mono font-bold text-gray-300 hidden sm:inline">
            {formatPoints(pointsAmount)} PTS
          </span>
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
        <div className="absolute top-16 left-0 right-0 bg-[#0B0C10] border-b border-[#202430] p-4 flex flex-col gap-2 md:hidden shadow-2xl z-50">
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
      )}
    </header>
  );
}
