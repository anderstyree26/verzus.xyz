'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGameStore } from '../lib/gameStore';
import { EloBadge } from './EloBadge';
import { NotificationBell } from './NotificationBell';

export function TopHeader() {
  const pathname = usePathname();
  const { activeGame } = useGameStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navTabs = [
    { href: '/', label: 'Overview', icon: '🎮', exact: true },
    { href: '/challenges', label: 'Play VS', icon: '⚔️' },
    { href: '/tournaments', label: 'Tournaments', icon: '🏆' },
    { href: '/leaderboards', label: 'Ladders', icon: '🥇' },
    { href: '/games', label: 'All Games', icon: '🕹️' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0C0C12]/95 backdrop-blur-md border-b border-[#1E1E2C] h-16 flex items-center justify-between px-4 sm:px-6 gap-4">
      {/* Left: Active Game Title & Navigation Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
        {/* Active Game Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#1E1E2C] border border-[#262638] flex items-center justify-center text-sm font-black text-[#FF5500]">
            ⚡
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider leading-none">
              Active Arena
            </span>
            <span className="text-sm font-black text-white tracking-tight leading-tight truncate max-w-[140px] sm:max-w-[200px]">
              {activeGame?.displayName || 'Counter-Strike 2'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs (FACEIT Style) */}
        <nav className="hidden md:flex items-center gap-1">
          {navTabs.map((tab) => {
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#FF5500] text-black shadow-md shadow-[#FF5500]/20'
                    : 'text-gray-400 hover:text-white hover:bg-[#161622]'
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
      <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
        <span className="absolute left-3 text-gray-500 text-xs">🔍</span>
        <input
          type="text"
          placeholder="Search players, cups, hubs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 bg-[#12121A] border border-[#1E1E2C] focus:border-[#FF5500] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition"
        />
      </div>

      {/* Right: Level 1-10 Elo Badge, EUR Wallet & Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
        {/* FACEIT Elo Level Badge Widget */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2.5 py-1 bg-[#12121A] hover:bg-[#181824] border border-[#1E1E2C] rounded-xl transition"
          title="Competitive Skill Rating"
        >
          <EloBadge elo={1650} size="sm" />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[9px] text-gray-400 font-mono leading-none">FACEIT ELO</span>
            <span className="text-xs font-black text-white font-mono leading-tight">1,650</span>
          </div>
        </Link>

        {/* Dual-Ledger EUR Wallet */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-1.5 bg-[#12121A] hover:bg-[#181824] border border-[#1E1E2C] rounded-xl text-xs transition"
          title="Wallet: EUR Cash & Points"
        >
          <span className="font-mono font-bold text-green-400">€0.00</span>
          <span className="text-gray-600">|</span>
          <span className="font-mono font-bold text-gray-300 hidden sm:inline">10K PTS</span>
          <span className="w-4 h-4 rounded-full bg-[#FF5500] text-black font-black text-[10px] flex items-center justify-center">
            +
          </span>
        </Link>

        <NotificationBell />

        {/* User Avatar */}
        <Link
          href="/dashboard"
          className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-[#FF5500] flex items-center justify-center font-black text-black text-xs shadow-md shadow-[#FF5500]/20 hover:scale-105 transition-transform"
          title="Player Profile"
        >
          U
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-white"
        >
          ☰
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#0C0C12] border-b border-[#1E1E2C] p-4 flex flex-col gap-2 md:hidden shadow-2xl">
          {navTabs.map((tab) => {
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                  isActive ? 'bg-[#FF5500] text-black' : 'text-gray-300 hover:bg-[#161622]'
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
