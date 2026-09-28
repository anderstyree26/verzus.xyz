'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface AuthPromptModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actionReason?: string;
}

export function AuthPromptModal({
  open,
  onClose,
  title = 'Join the Competitive Arena',
  description = 'Create a free account or sign in to enter duels, wager in cash cups, and build your competitive MMR.',
  actionReason = 'Account required to compete and stake entry fees.',
}: AuthPromptModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 text-foreground flex flex-col gap-5 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground font-black text-xl flex items-center justify-center shadow-lg">
            VX
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground flex items-center justify-center text-sm font-bold transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div>
          <Badge variant="copper" className="text-[10px] mb-2 font-mono">
            COMPETITIVE ACCESS
          </Badge>
          <h3 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight leading-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="p-3.5 bg-secondary/60 rounded-2xl border border-border text-xs space-y-1.5">
          <div className="font-bold text-foreground flex items-center gap-1.5">
            <span>🛡️</span> Automated Match Verification
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {actionReason} Automated game sync confirms match scores in the background automatically.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link href="/signup" onClick={onClose} className="w-full">
            <Button variant="default" size="lg" className="w-full font-black text-xs uppercase tracking-wider">
              🚀 Create Free Account
            </Button>
          </Link>
          <Link href="/login" onClick={onClose} className="w-full">
            <Button variant="secondary" size="lg" className="w-full font-bold text-xs uppercase tracking-wider">
              Log In to Existing Account
            </Button>
          </Link>
        </div>

        <div className="text-center text-[10px] text-muted-foreground font-mono">
          Free Demo Mode (PTS) & Real Stakes (€ EUR) Available
        </div>
      </div>
    </div>
  );
}
