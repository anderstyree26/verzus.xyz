import * as React from 'react';
import { cn } from '@antigravity/ui';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'copper' | 'success' | 'warning' | 'destructive';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors';

  const variants = {
    default: 'bg-[#161922] text-gray-300 border border-[#202430]',
    copper: 'bg-[#C86228]/15 text-[#D97736] border border-[#C86228]/30',
    secondary: 'bg-[#111319] text-gray-400 border border-[#202430]',
    outline: 'border border-[#202430] text-gray-400',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    destructive: 'bg-red-500/15 text-red-400 border border-red-500/30',
  };

  return (
    <div className={cn(base, variants[variant], className)} {...props} />
  );
}
