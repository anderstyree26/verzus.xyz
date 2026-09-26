'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationBell } from './NotificationBell';
import { GameSwitcher } from './GameSwitcher';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { href: '/challenges', label: 'Play VS', icon: '⚔️' },
    { href: '/tournaments', label: 'Tournaments', icon: '🏆' },
    { href: '/leaderboards', label: 'Ladders', icon: '🥇' },
    { href: '/games', label: 'Games', icon: '🎮' },
    { href: '/admin', label: 'Admin', icon: '🛡️' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0C0C12]/95 backdrop-blur-md border-b border-[#1E1E2C]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Game Switcher */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0" onClick={() => setIsOpen(false)}>
            <span className="w-8 h-8 rounded-lg bg-[#FF5500] flex items-center justify-center font-black text-white text-base shadow-[0_0_15px_rgba(255,85,0,0.6)]">
              VX
            </span>
            <span className="font-black tracking-tight text-lg text-white hidden sm:inline">
              VERZUS<span className="text-[#FF5500]">XYZ</span>
            </span>
          </Link>

          {/* Embedded Game Switcher */}
          <div className="hidden sm:block">
            <GameSwitcher />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 text-xs font-bold uppercase tracking-wider text-gray-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition hover:text-white ${
                  pathname.startsWith(link.href) ? 'text-[#FF5500] border-b-2 border-[#FF5500] pb-1' : 'text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Elo Badge, EUR Wallet & Quick Play Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Level & Elo Badge (FACEIT Style) */}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#161622] hover:bg-[#1C1C2C] border border-[#262638] rounded-lg transition"
            title="Your Competitive Elo & Level"
          >
            <span className="w-5 h-5 rounded bg-[#FF5500] flex items-center justify-center text-[10px] font-black text-white font-mono shadow">
              7
            </span>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-gray-400 font-mono leading-none">LVL 7</span>
              <span className="text-xs font-bold text-white font-mono leading-tight">1,650 ELO</span>
            </div>
          </Link>

          {/* Unified EUR Wallet Pill */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-1.5 bg-surface hover:bg-surface-elevated border border-surface-border rounded-lg text-xs transition"
            title="Wallet: Unified EUR & Points"
          >
            <span className="font-bold text-green-400 font-mono">€0.00</span>
            <span className="text-gray-600">|</span>
            <span className="font-semibold text-gray-300 font-mono">10,000 PTS</span>
          </Link>

          <NotificationBell />

          <Link
            href="/matches/new"
            className="px-4 py-2 bg-[#FF5500] hover:bg-[#FF4400] font-black text-xs rounded-lg text-white transition shadow-[0_0_15px_rgba(255,85,0,0.4)] flex items-center gap-1.5 tracking-wider uppercase"
          >
            <span>⚔️</span>
            <span>Play VS</span>
          </Link>

          <Link
            href="/login"
            className="px-3 py-2 bg-surface hover:bg-surface-elevated border border-surface-border text-xs font-semibold rounded-lg text-white transition"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile Header Right */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Game Switcher Preview */}
          <div className="block sm:hidden">
            <GameSwitcher />
          </div>

          <NotificationBell />

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-300 hover:text-white hover:bg-surface-elevated rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF5500]"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-[#1E1E2C] bg-[#0C0C12]/98 backdrop-blur-xl px-4 pt-3 pb-6 transition-all duration-200 text-white">
          {/* User Rank & Wallet Overview */}
          <div className="p-3 mb-3 bg-[#161622] rounded-xl border border-[#262638] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#FF5500] flex items-center justify-center text-xs font-black font-mono">
                7
              </span>
              <div>
                <span className="text-xs font-bold block">Level 7 · 1,650 ELO</span>
                <span className="text-[10px] text-gray-400">Competitive Rank</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono font-bold text-xs text-green-400 block">€0.00 EUR</span>
              <span className="font-mono text-[10px] text-gray-400">10,000 PTS</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition ${
                  pathname.startsWith(link.href)
                    ? 'bg-[#FF5500]/15 text-[#FF5500]'
                    : 'text-gray-200 hover:bg-surface hover:text-white'
                }`}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-4 pt-4 border-t border-surface-border flex flex-col gap-2">
            <Link
              href="/matches/new"
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 bg-[#FF5500] hover:bg-[#FF4400] font-black text-xs rounded-lg text-white transition text-center shadow-md flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>⚔️</span>
              <span>Play VS (Quick Match)</span>
            </Link>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 bg-surface hover:bg-surface-elevated border border-surface-border text-xs font-semibold rounded-lg text-white transition text-center"
            >
              Sign In / Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
