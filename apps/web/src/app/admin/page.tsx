'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';

interface PlatformStats {
  users: number;
  matches: number;
  tournaments: number;
}

export default function AdminDashboardPage() {
  const { data: stats } = useQuery<PlatformStats>({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient<PlatformStats>('/admin/stats'),
  });

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin & Moderator Hub</h1>
        <p className="text-sm text-gray-400">Platform operations, moderation, and review queues.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-surface-elevated border border-surface-border rounded-lg text-center">
          <span className="text-xs uppercase text-gray-400">Total Users</span>
          <div className="text-3xl font-bold font-mono text-accent mt-1">{stats?.users ?? 0}</div>
        </div>

        <div className="p-5 bg-surface-elevated border border-surface-border rounded-lg text-center">
          <span className="text-xs uppercase text-gray-400">Matches Played</span>
          <div className="text-3xl font-bold font-mono text-white mt-1">{stats?.matches ?? 0}</div>
        </div>

        <div className="p-5 bg-surface-elevated border border-surface-border rounded-lg text-center">
          <span className="text-xs uppercase text-gray-400">Tournaments Hosted</span>
          <div className="text-3xl font-bold font-mono text-white mt-1">{stats?.tournaments ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
        <Link
          href="/games/new"
          className="p-5 bg-accent/15 border border-accent/40 rounded-lg hover:bg-accent/25 transition flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">New Game Profile</h3>
              <span className="px-2 py-0.5 bg-accent text-white font-bold text-[10px] rounded">AUTO-CALIBRATE</span>
            </div>
            <p className="text-xs text-gray-300 mt-1">Upload reference screenshots to auto-calibrate OCR and publish games.</p>
          </div>
          <span className="text-xs font-bold text-accent mt-3">Launch Auto-Calibrator →</span>
        </Link>

        <Link
          href="/admin/profiles"
          className="p-5 bg-surface-elevated border border-surface-border rounded-lg hover:border-accent/40 transition"
        >
          <h3 className="font-bold text-white text-base">Approve Game Profiles</h3>
          <p className="text-xs text-gray-400 mt-1">Review user-submitted archetypes and ROI calibrations.</p>
        </Link>

        <Link
          href="/admin/review"
          className="p-5 bg-surface-elevated border border-surface-border rounded-lg hover:border-accent/40 transition"
        >
          <h3 className="font-bold text-white text-base">HITL Review Queue</h3>
          <p className="text-xs text-gray-400 mt-1">Audit low-confidence OCR reads and dispute flags.</p>
        </Link>

        <Link
          href="/admin/users"
          className="p-5 bg-surface-elevated border border-surface-border rounded-lg hover:border-accent/40 transition"
        >
          <h3 className="font-bold text-white text-base">User Management</h3>
          <p className="text-xs text-gray-400 mt-1">Assign roles (Reviewer, Admin) and enforce bans.</p>
        </Link>

        <Link
          href="/admin/sponsors"
          className="p-5 bg-surface-elevated border border-surface-border rounded-lg hover:border-accent/40 transition"
        >
          <h3 className="font-bold text-white text-base">Sponsor Funding</h3>
          <p className="text-xs text-gray-400 mt-1">Manage tournament prize sponsors.</p>
        </Link>

        <Link
          href="/admin/seasons"
          className="p-5 bg-surface-elevated border border-surface-border rounded-lg hover:border-accent/40 transition"
        >
          <h3 className="font-bold text-white text-base">Seasons Management</h3>
          <p className="text-xs text-gray-400 mt-1">Create new seasons and reset Elo leaderboards.</p>
        </Link>
      </div>
    </div>
  );
}
