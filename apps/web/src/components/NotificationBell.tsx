'use client';

import { useState } from 'react';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount] = useState(0);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-surface-elevated text-gray-300 hover:text-white transition"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full animate-ping" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-surface-elevated border border-surface-border rounded-lg shadow-xl p-3 z-50 text-xs">
          <div className="font-bold text-gray-300 pb-2 border-b border-surface-border mb-2 flex justify-between">
            <span>Notifications</span>
            <span className="text-[10px] text-accent">Realtime</span>
          </div>
          <div className="py-6 text-center text-gray-500">
            You're all caught up! No new notifications.
          </div>
        </div>
      )}
    </div>
  );
}
