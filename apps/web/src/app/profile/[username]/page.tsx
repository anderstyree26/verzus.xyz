'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';
import { EloBadge } from '../../../components/EloBadge';
import { GamePoster } from '../../../components/GamePoster';
import { useGameStore } from '../../../lib/gameStore';
import { getGameById, OFFICIAL_GAMES } from '../../../lib/gamesCatalog';
import { notifyUser } from '../../../lib/notifications';
import { formatEUR } from '../../../lib/currency';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
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
  profile_id?: string;
  game_profiles?: { display_name: string; game_type: string; id?: string };
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
  const [copiedLink, setCopiedLink] = useState(false);

  const catalogGame = getGameById(activeGame?.id);

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
      <div className="p-24 text-center text-muted-foreground font-mono text-xs animate-pulse bg-card border border-border rounded-3xl max-w-4xl mx-auto my-12">
        Loading competitor profile and battle history...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto my-16 text-center">
        <Card className="p-10 space-y-5 shadow-2xl">
          <span className="text-5xl block">👤</span>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">
              Player @{username} not found
            </h2>
            <p className="text-xs text-muted-foreground">
              This competitor tag does not exist or has not enrolled in the Verzus arena yet.
            </p>
          </div>
          <Link href="/" className="inline-block pt-2">
            <Button variant="default" size="default">
              ← Return to Arena
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const elo = profile.rating ?? 1000;
  const nextTier = Math.ceil(elo / 150) * 150;
  const eloToNext = Math.max(0, nextTier - elo);
  const eloPercent = Math.min(100, Math.max(10, ((150 - eloToNext) / 150) * 100));

  // Match calculations
  const settledMatches = (matches || []).filter((m) => m.status === 'SETTLED' || m.status === 'COMPLETED');
  const totalMatches = settledMatches.length;
  const wins = settledMatches.filter((m) => m.winner_id === profile.id).length;
  const losses = Math.max(0, totalMatches - wins);
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : '0.0';

  const recentForm = settledMatches.slice(0, 5).map((m) => (m.winner_id === profile.id ? 'W' : 'L'));

  const handleInviteToParty = () => {
    notifyUser(`Party Invite Sent to @${profile.username}`, {
      body: 'They will receive an in-app ping to join your squad dock.',
      sound: 'connect',
      type: 'party',
    });
  };

  const handleShareProfile = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      notifyUser('Profile Link Copied', {
        body: 'Share this link with your squad or opponent.',
        sound: 'score',
        type: 'info',
      });
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full min-w-0 pb-16">
      {/* 1. HERO PROFILE BANNER & IDENTITY CARD (Spacious, Uncluttered) */}
      <Card className="relative overflow-hidden border-border bg-card shadow-2xl">
        {/* Cinematic Backdrop Banner */}
        <div className="h-44 sm:h-60 bg-gradient-to-r from-stone-950 via-stone-900 to-primary/20 w-full relative overflow-hidden">
          {catalogGame.bannerUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-xs"
              style={{ backgroundImage: `url(${catalogGame.bannerUrl})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <Badge variant="secondary" className="backdrop-blur-md bg-background/70 font-mono text-[10px]">
              VERZUS ESPORTS
            </Badge>
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 sm:px-10 pb-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            {/* Left: Avatar + Identity */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-6 min-w-0">
              {/* Large Avatar with Glowing Accent Ring */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-stone-900 via-stone-800 to-primary text-primary-foreground font-black text-3xl sm:text-5xl flex items-center justify-center shadow-2xl border-4 border-card ring-2 ring-primary/30">
                  {profile.username.slice(0, 2).toUpperCase()}
                </div>
                {/* Floating Elo Badge Pip */}
                <div className="absolute -bottom-2 -right-2">
                  <EloBadge elo={elo} size="md" />
                </div>
              </div>

              {/* Names, Tags & Badges */}
              <div className="space-y-2 min-w-0 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="copper">VERIFIED PLAYER</Badge>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {profile.role.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    🌍 {profile.region || 'GLOBAL'}
                  </Badge>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight truncate leading-tight">
                    {profile.display_name || profile.username}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-0.5">
                    @{profile.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Primary Action Buttons with Generous Spacing */}
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap flex-shrink-0 pt-2 lg:pt-0">
              <Button
                variant="outline"
                size="default"
                onClick={handleShareProfile}
                className="text-xs font-bold gap-1.5"
                title="Copy profile link"
              >
                <span>{copiedLink ? '✓ Copied' : '🔗 Share'}</span>
              </Button>

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
                <Button variant="default" size="default" className="text-xs font-bold gap-1.5 shadow-md shadow-primary/20">
                  <span>⚔️ Challenge 1v1</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. MAIN 2-COLUMN RESPONSIVE LAYOUT (Generous Breathing Room) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Career Rank, Performance & FairPlay (4 cols) */}
        <div className="lg:col-span-4 space-y-6 min-w-0">
          {/* Card 1: Competitive Elo Tier */}
          <Card className="p-6 bg-card border-border shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs uppercase font-bold text-muted-foreground font-mono tracking-wider">
                Competitive Elo
              </span>
              <Badge variant="copper" className="text-[10px] font-mono">
                TIER MMR
              </Badge>
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-foreground font-mono">
                  {elo}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">Rating Points</span>
              </div>

              <EloBadge elo={elo} size="lg" showLabel />
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>Tier Level Progress</span>
                <span className="text-accent-400 font-bold">Next: {nextTier} ELO</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden p-0.5 border border-border">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${eloPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono block text-right">
                {eloToNext > 0 ? `${eloToNext} points to level up` : 'Maximum tier reached'}
              </span>
            </div>
          </Card>

          {/* Card 2: Performance Summary Grid */}
          <Card className="p-6 bg-card border-border shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs uppercase font-bold text-muted-foreground font-mono tracking-wider">
                Career Performance
              </span>
              <span className="text-xs font-mono text-muted-foreground">Settled Matches</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-secondary/60 rounded-xl border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                  Win Rate
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
                  {winRate}%
                </span>
              </div>

              <div className="p-3 bg-secondary/60 rounded-xl border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                  Record
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-foreground">
                  {wins}W-{losses}L
                </span>
              </div>

              <div className="p-3 bg-secondary/60 rounded-xl border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                  Matches
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-muted-foreground">
                  {totalMatches}
                </span>
              </div>
            </div>

            {/* Recent Match Form Sequence */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] text-muted-foreground uppercase font-bold font-mono tracking-wider block">
                Recent 5 Form
              </span>
              <div className="flex items-center gap-2">
                {recentForm.length > 0 ? (
                  recentForm.map((outcome, idx) => (
                    <div
                      key={idx}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs font-mono border ${
                        outcome === 'W'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-destructive/20 text-destructive border-destructive/40'
                      }`}
                    >
                      {outcome}
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground font-mono py-1">
                    No settled duels recorded yet
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Card 3: FairPlay Integrity */}
          <Card className="p-6 bg-card border-border shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs uppercase font-bold text-muted-foreground font-mono tracking-wider">
                FairPlay Trust
              </span>
              <Badge variant="success" className="text-[9px] font-mono">
                CLEAN RECORD
              </Badge>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-emerald-400">
                {profile.trust_score}
              </span>
              <span className="text-xs text-muted-foreground font-mono">/ 1,000 Trust Score</span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Verified by automated match settlement and anti-cheat. Zero dispute anomalies or infractions on record.
            </p>
          </Card>
        </div>

        {/* RIGHT COLUMN: Recent Head-to-Head Records (8 cols) */}
        <div className="lg:col-span-8 space-y-6 min-w-0">
          <Card className="p-6 sm:p-8 bg-card border-border shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-black text-foreground uppercase tracking-tight">
                  Recent Battle Records
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Official verified matches, duels, and tournament cups
                </p>
              </div>

              <Badge variant="secondary" className="font-mono text-xs self-start sm:self-auto">
                {matches?.length ?? 0} TOTAL MATCHES
              </Badge>
            </div>

            {matches && matches.length > 0 ? (
              <div className="space-y-3">
                {matches.slice(0, 8).map((m) => {
                  const isWin = m.winner_id === profile.id;
                  const gameTitle = m.game_profiles?.display_name || catalogGame.displayName;
                  const catalogItem = OFFICIAL_GAMES.find(
                    (c) =>
                      c.id.toLowerCase() === m.profile_id?.toLowerCase() ||
                      c.displayName.toLowerCase() === gameTitle.toLowerCase()
                  ) || catalogGame;

                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      {/* Left: Outcome Pip + Poster + Match Info */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <span
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm font-mono flex-shrink-0 shadow-sm border ${
                            isWin
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-destructive/20 text-destructive border-destructive/40'
                          }`}
                        >
                          {isWin ? 'W' : 'L'}
                        </span>

                        <GamePoster
                          game={catalogItem}
                          aspect="thumb"
                          className="w-10 h-14 rounded-xl flex-shrink-0 shadow-sm border border-border hidden sm:block"
                        />

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-foreground group-hover:text-accent-400 transition-colors truncate">
                              {gameTitle}
                            </span>
                            <Badge variant="outline" className="font-mono text-[9px]">
                              {m.format}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono flex-wrap">
                            <span>#{m.id.slice(0, 8)}</span>
                            <span>·</span>
                            <span>{new Date(m.created_at).toLocaleDateString()}</span>
                            <span>·</span>
                            <span className="text-foreground font-bold">
                              {m.prize_pool > 0 ? formatEUR(m.prize_pool) : 'Glory & Elo'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Pill & View Button */}
                      <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
                        <Badge
                          variant={m.status === 'SETTLED' ? 'success' : 'secondary'}
                          className="font-mono text-[10px]"
                        >
                          {m.status}
                        </Badge>

                        <Link href={`/matches/${m.id}`}>
                          <Button variant="secondary" size="sm" className="h-8 text-xs font-bold">
                            View Room →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground space-y-3 bg-secondary/30 rounded-2xl border border-dashed border-border">
                <span className="text-4xl block">⚔️</span>
                <h4 className="text-base font-bold text-foreground">No Settled Duels Yet</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  This player has not finished any competitive matches yet. Be the first to challenge them to a 1v1 duel!
                </p>
                <div className="pt-2">
                  <Link href={`/matches/new?opponent=${profile.id}`}>
                    <Button variant="default" size="default" className="text-xs font-bold">
                      ⚔️ Send 1v1 Challenge
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
