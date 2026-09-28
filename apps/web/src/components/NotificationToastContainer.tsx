'use client';

import Link from 'next/link';
import { useNotificationStore, type NotificationType } from '../lib/notificationStore';
import { Button } from './ui/button';

function getToastIcon(type?: NotificationType) {
  switch (type) {
    case 'match':
      return '⚔️';
    case 'success':
      return '🏆';
    case 'party':
      return '👥';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    default:
      return '🔔';
  }
}

function getToastBadgeClass(type?: NotificationType) {
  switch (type) {
    case 'match':
      return 'bg-primary/20 text-accent-400 border-primary/40';
    case 'success':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    case 'party':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    case 'warning':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    case 'error':
      return 'bg-destructive/20 text-destructive border-destructive/40';
    default:
      return 'bg-secondary text-foreground border-border';
  }
}

export function NotificationToastContainer() {
  const { activeToasts, dismissToast } = useNotificationStore();

  if (!activeToasts || activeToasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {activeToasts.map((toast) => {
        const icon = getToastIcon(toast.type);
        const badgeClass = getToastBadgeClass(toast.type);

        return (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-2xl bg-card/95 backdrop-blur-md border border-border p-4 shadow-2xl text-foreground flex flex-col gap-2.5 animate-in slide-in-from-bottom-5 fade-in duration-200 transition-all hover:border-primary/50"
            role="alert"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm flex-shrink-0 ${badgeClass}`}>
                  {icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-foreground leading-snug truncate">
                    {toast.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed break-words">
                    {toast.body}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-muted-foreground hover:text-foreground p-1 text-xs transition rounded-lg hover:bg-secondary flex-shrink-0"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>

            {toast.actionUrl && toast.actionLabel && (
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-border">
                <Link
                  href={toast.actionUrl}
                  onClick={() => dismissToast(toast.id)}
                >
                  <Button variant="copper" size="sm" className="h-7 text-[10px] px-3 font-bold uppercase tracking-wider">
                    {toast.actionLabel} →
                  </Button>
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
