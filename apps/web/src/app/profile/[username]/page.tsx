'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';
import { EloBadge } from '../../../components/EloBadge';
import { useGameStore } from '../../../lib/gameStore';
import { notifyUser } from '../../../lib/notifications';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardContent } from '../../../components/ui/card';
import { Separator } from '../../../components/ui/separator';

interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  trust_score: number;
  role: string;
  region?: string;
  rating?: number;
}

interface MatchRecord {
  id: string;
  game_profiles?: { display_name: string; game_type: string };
  format: string;
  status: string;
  entry_fee: number;
  prize_pool: number;
  created_at: string;
  winner_id?: string | null;
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { activeGame } = useGameStore();

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['public-profile', username],
    queryFn: () => apiClient<UserProfile>(`/profile/${username}`),
  });

  const { data: matches } = useQuery<MatchRecord[]>({
    queryKey: ['public-profile-matches', username],
    queryFn: () => apiClient<MatchRecord[]>('/matches/mine').catch(() => []),
  });

  if (isLoading) {
    return (
      <div className="p-16 text-center text-muted-foreground font-mono text-xs animate-pulse bg-card border border-border rounded-3xl max-w-4xl mx-auto">
        Loading player profile and competitive history...
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="p-10 text-center max-w-lg mx-auto space-y-4">
        <span className="text-4xl block">👤</span>
        <h2 className="text-lg font-black text-foreground uppercase">Player @{username} not found</h2>
        <p className="text-xs text-muted-foreground">
          This gamer tag does not exist or has not enrolled in the Verzus arena yet.
        </p>
        <Link href="/" className="inline-block">
          <Button variant="copper" size="sm">
            ← Back to Arena
          </Button>
        </Link>
      </Card>
    );
  }

  const elo = profile.rating ?? 1000;
  const nextTier = Math.ceil(elo / 150) * 150;
  const eloToNext = Math.max(0, nextTier - elo);
  const eloPercent = Math.min(100, Math.max(10, ((150 - eloToNext) / 150) * 100));

  const handleInviteToParty = () => {
    notifyUser(`Party Invite Sent to @${profile.username}`, {
      body: 'They will receive an in-app ping to join your squad dock.',
      sound: 'connect',
      type: 'party',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full min-w-0">
      {/* 1. Header Card with Banner & Competitor Identification */}
      <Card className="relative overflow-hidden border-border bg-card shadow-2xl">
        {/* Banner ambient backdrop */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-stone-900 via-secondary to-primary/20 w-full relative">
          <div className="absolute inset-0 bg-[radial-gradient(#C86228_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        </div>

        <div className="p-4 sm:p-6 pt-0 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
            {/* Avatar + Identity */}
            <div className="flex items-end gap-3 sm:gap-4 min-w-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-stone-900 via-stone-800 to-primary text-primary-foreground font-black text-2xl sm:text-3xl flex items-center justify-center shadow-2xl border-4 border-card flex-shrink-0">
                {profile.username.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1 pb-1">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                  <Badge variant="copper">VERIFIED COMPETITOR</Badge>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {profile.role.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {profile.region || 'GLOBAL'}
                  </Badge>
                </div>

                <h1 className="text-xl sm:text-3xl font-black text-foreground tracking-tight truncate leading-tight">
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-xs text-muted-foreground font-mono truncate">@{profile.username}</p>
              </div>
            </div>

            {/* Actions + Elo Pill */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap flex-shrink-0 pt-2 sm:pt-0">
              <EloBadge elo={elo} size="md" showLabel />

              <Button
                variant="secondary"
                size="default"
                onClick={handleInviteToParty}
                className="text-xs font-bold gap-1.5"
              >
                <span>👥 Invite Squad</span>
              </Button>

              <Link
                href={activeGame ? `/matches/new?profileId=${activeGame.id}&opponent=${profile.id}` : '/matches/new'}
              >
                <Button variant="default" size="default" className="text-xs font-bold">
                  ⚔️ Challenge 1v1
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Key Metrics & Rating Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Elo Rating Card */}
        <Card className="p-4 bg-card border-border flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono tracking-wider">
                Competitive Elo
              </span>
              <Badge variant="copper" className="text-[9px]">
                TIER RATING
              </Badge>
            </div>
            <div className="text-3xl font-black text-foreground font-mono mt-1">
              {elo}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-1">
              <span>Current Tier</span>
              <span>Next: {nextTier}</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${eloPercent}%` }}
              />
            </div>
          </div>
        </Card>

        {/* FairPlay Trust Score */}
        <Card className="p-4 bg-card border-border flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono tracking-wider">
                FairPlay Trust
              </span>
              <Badge variant="success" className="text-[9px]">
                ANTI-CHEAT ACTIVE
              </Badge>
            </div>
            <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
              {profile.trust_score} <span className="text-xs text-muted-foreground font-sans">/ 1000</span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-snug">
            Verified by client-side OCR match analysis. 0 dispute anomalies recorded.
          </p>
        </Card>

        {/* Region & Match Readiness */}
        <Card className="p-4 bg-card border-border flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono tracking-wider">
                Arena Match Readiness
              </span>
              <Badge variant="secondary" className="text-[9px]">
                READY
              </Badge>
            </div>
            <div className="text-3xl font-black text-accent-400 font-mono mt-1">
              {profile.region || 'GLOBAL'}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-snug">
            Low latency ping routing enabled for instant head-to-head duels.
          </p>
        </Card>
      </div>

      {/* 3. Match History Table / Feed */}
      <Card className="p-4 sm:p-6 bg-card border-border space-y-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="font-black text-base sm:text-lg text-foreground uppercase tracking-tight">
              Recent Head-to-Head Record
            </h3>
            <p className="text-xs text-muted-foreground">
              Official verified competitive duels played on Verzus
            </p>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {matches?.length ?? 0} MATCHES
          </Badge>
        </div>

        {matches && matches.length > 0 ? (
          <div className="divide-y divide-border overflow-x-hidden">
            {matches.slice(0, 5).map((m) => {
              const isWin = m.winner_id === profile.id;
              return (
                <div
                  key={m.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-mono flex-shrink-0 ${
                        isWin
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-destructive/20 text-destructive border border-destructive/30'
                      }`}
                    >
                      {isWin ? 'W' : 'L'}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-foreground truncate">
                          {m.game_profiles?.display_name || 'Arena Duel'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          #{m.id.slice(0, 8)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Format: {m.format} · Status: {m.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto flex-shrink-0">
                    <Badge variant={m.status === 'SETTLED' ? 'success' : 'secondary'}>
                      {m.status}
                    </Badge>
                    <Link href={`/matches/${m.id}`}>
                      <Button variant="secondary" size="sm" className="h-7 text-[11px]">
                        Match Details →
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground text-xs font-mono">
            No public match records settled for this profile yet.
          </div>
        )}
      </Card>
    </div>
  );
}
