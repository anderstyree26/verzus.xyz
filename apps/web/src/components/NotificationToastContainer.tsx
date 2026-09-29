'use client';

import Link from 'next/link';
import {
  Swords,
  Trophy,
  Users,
  AlertTriangle,
  XCircle,
  Bell,
  X,
  ArrowRight,
} from 'lucide-react';
import { useNotificationStore, type NotificationType } from '../lib/notificationStore';
import { Button } from './ui/button';

function getToastIcon(type?: NotificationType) {
  switch (type) {
    case 'match':
      return <Swords className="w-4 h-4 text-primary" />;
    case 'success':
      return <Trophy className="w-4 h-4 text-emerald-400" />;
    case 'party':
      return <Users className="w-4 h-4 text-blue-400" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    case 'error':
      return <XCircle className="w-4 h-4 text-destructive" />;
    default:
      return <Bell className="w-4 h-4 text-primary" />;
  }
}

function getToastBadgeClass(type?: NotificationType) {
  switch (type) {
    case 'match':
      return 'bg-primary/10 border-primary/30';
    case 'success':
      return 'bg-emerald-500/10 border-emerald-500/30';
    case 'party':
      return 'bg-blue-500/10 border-blue-500/30';
    case 'warning':
      return 'bg-amber-500/10 border-amber-500/30';
    case 'error':
      return 'bg-destructive/10 border-destructive/30';
    default:
      return 'bg-muted border-border';
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
            className="pointer-events-auto rounded-xl bg-card/95 backdrop-blur-md border border-border p-4 shadow-2xl text-foreground flex flex-col gap-2.5 animate-in slide-in-from-bottom-5 fade-in duration-200 transition-all hover:border-primary/50"
            role="alert"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${badgeClass}`}>
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
                className="text-muted-foreground hover:text-foreground p-1 text-xs transition rounded-lg hover:bg-muted flex-shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {toast.actionUrl && toast.actionLabel && (
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-border">
                <Link
                  href={toast.actionUrl}
                  onClick={() => dismissToast(toast.id)}
                >
                  <Button variant="default" size="sm" className="h-7 text-[10px] px-2.5 font-bold uppercase tracking-wider gap-1">
                    <span>{toast.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
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
