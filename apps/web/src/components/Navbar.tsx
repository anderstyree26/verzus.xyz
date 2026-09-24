'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationBell } from './NotificationBell';

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
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/challenges', label: 'Challenges', icon: '⚔️' },
    { href: '/tournaments', label: 'Tournaments', icon: '🏆' },
    { href: '/games', label: 'Games', icon: '🎮' },
    { href: '/leaderboards', label: 'Leaderboards', icon: '🥇' },
    { href: '/admin', label: 'Admin', icon: '🛡️' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center font-extrabold text-white text-sm shadow-[0_0_12px_rgba(139,92,246,0.6)]">
              VX
            </span>
            <span className="font-extrabold tracking-tight text-lg text-white">
              VERZUSXYZ
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition hover:text-white ${
                  pathname.startsWith(link.href) ? 'text-accent font-semibold' : 'text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <NotificationBell />
          <Link
            href="/matches/new"
            className="px-3.5 py-1.5 bg-accent hover:bg-accent-600 font-bold text-xs rounded-md text-white transition shadow-sm"
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

        {/* Mobile Header Right */}
        <div className="flex md:hidden items-center gap-3">
          <NotificationBell />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-300 hover:text-white hover:bg-surface-elevated rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
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
        <div className="md:hidden border-b border-surface-border bg-surface-elevated/95 backdrop-blur-lg px-4 pt-3 pb-6 transition-all duration-200">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  pathname.startsWith(link.href)
                    ? 'bg-accent/15 text-accent font-bold'
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
              className="w-full py-2.5 bg-accent hover:bg-accent-600 font-bold text-xs rounded-lg text-white transition text-center shadow-md flex items-center justify-center gap-2"
            >
              <span>⚔️</span>
              <span>Create Match</span>
            </Link>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 bg-surface hover:bg-surface-border border border-surface-border text-xs font-semibold rounded-lg text-white transition text-center"
            >
              Sign In / Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
