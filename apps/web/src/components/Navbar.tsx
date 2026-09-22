'use client';

import Link from 'next/link';
import { NotificationBell } from './NotificationBell';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center font-extrabold text-white text-sm shadow-[0_0_12px_rgba(139,92,246,0.6)]">
              AG
            </span>
            <span className="font-extrabold tracking-tight text-lg text-white">
              ANTIGRAVITY
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/challenges" className="hover:text-white transition">Challenges</Link>
            <Link href="/tournaments" className="hover:text-white transition">Tournaments</Link>
            <Link href="/games" className="hover:text-white transition">Games</Link>
            <Link href="/leaderboards" className="hover:text-white transition">Leaderboards</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <Link
            href="/matches/new"
            className="hidden sm:inline-flex px-3.5 py-1.5 bg-accent hover:bg-accent-600 font-bold text-xs rounded-md text-white transition shadow-sm"
          >
            Create Match
          </Link>
          <Link
            href="/login"
            className="px-3.5 py-1.5 bg-surface-elevated hover:bg-surface-border border border-surface-border text-xs font-semibold rounded-md text-white transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
