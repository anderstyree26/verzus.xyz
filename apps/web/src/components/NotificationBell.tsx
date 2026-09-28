'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotificationStore, type NotificationItem } from '../lib/notificationStore';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

function formatTimeAgo(timestamp: number) {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition border border-border"
        aria-label="Notifications"
        title="View Notifications"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl p-4 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-accent-400 font-mono text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[10px] text-muted-foreground hover:text-foreground font-semibold"
                >
                  Mark read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[10px] text-destructive hover:opacity-80 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border pr-1 py-1">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground flex flex-col items-center gap-2">
                <span className="text-2xl">🔔</span>
                <span className="text-xs">You're all caught up! No notifications.</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3 transition-colors cursor-pointer flex flex-col gap-1.5 rounded-xl ${
                    !n.read ? 'bg-secondary/70' : 'hover:bg-secondary/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-foreground leading-snug">
                      {n.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
                      {formatTimeAgo(n.timestamp)}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {n.body}
                  </p>

                  {n.actionUrl && n.actionLabel && (
                    <div className="pt-1">
                      <Link
                        href={n.actionUrl}
                        onClick={() => setOpen(false)}
                        className="inline-block text-[10px] font-bold text-accent-400 hover:underline"
                      >
                        {n.actionLabel} →
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <Separator className="my-2" />

          <div className="text-[10px] text-muted-foreground text-center font-mono">
            Live match alerts & instant score sync active
          </div>
        </div>
      )}
    </div>
  );
}
