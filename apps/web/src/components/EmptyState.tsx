'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="p-8 sm:p-12 bg-card border border-border rounded-2xl flex flex-col items-center justify-center text-center gap-4 shadow-sm animate-in fade-in duration-200">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-muted/80 text-muted-foreground flex items-center justify-center shadow-inner">
        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
      </div>

      <div className="space-y-1 max-w-md">
        <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && (
        <div className="pt-2">
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="default" size="sm" className="font-bold text-xs uppercase tracking-wider">
                {actionLabel}
              </Button>
            </Link>
          ) : onAction ? (
            <Button
              variant="default"
              size="sm"
              onClick={onAction}
              className="font-bold text-xs uppercase tracking-wider"
            >
              {actionLabel}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
