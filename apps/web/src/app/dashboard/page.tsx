'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { WalletCard } from '../../components/WalletCard';
import { EloBadge } from '../../components/EloBadge';
import { apiClient } from '../../lib/api';
import { useGameStore } from '../../lib/gameStore';
import { formatEUR } from '../../lib/currency';
import { getGameById, OFFICIAL_GAMES } from '../../lib/gamesCatalog';
import { GamePoster } from '../../components/GamePoster';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent } from '../../components/ui/card';

interface MatchItem {
  id: string;
  profile_id?: string;
  game_profiles?: { display_name: string; game_type: string };
  format: string;
  status: string;
  entry_fee: number;
  prize_pool: number;
  created_at: string;
  room_code?: string;
}

export default function DashboardPage() {
  const { activeGame } = useGameStore();

  const { data: userProfile } = useQuery<{ rating?: number; username?: string }>({
    queryKey: ['dashboard-profile'],
    queryFn: () => apiClient<{ rating?: number; username?: string }>('/profile/me').catch(() => ({ rating: 1000 })),
  });

  const { data: matches, isLoading } = useQuery<MatchItem[]>({
    queryKey: ['my-matches'],
    queryFn: () => apiClient<MatchItem[]>('/matches/mine'),
  });

  const elo = userProfile?.rating ?? 1000;
  const username = userProfile?.username || 'Competitor';
  const catalogGame = getGameById(activeGame?.id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0">
      {/* Player Header Banner */}
      <Card className="p-4 sm:p-6 bg-card border-border shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-stone-900 to-primary text-primary-foreground font-black text-xl flex items-center justify-center shadow-md flex-shrink-0">
              {username.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider font-mono">
                  Player Command Center
                </span>
                <Badge variant="copper" className="text-[9px]">
                  {catalogGame.displayName}
                </Badge>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground truncate">
                  @{username}
                </h1>
                <EloBadge elo={elo} size="md" showLabel />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap flex-shrink-0">
            <Link href="/matches/new">
              <Button variant="default" size="default" className="text-xs font-bold">
                ⚔️ Host Duel
              </Button>
            </Link>
            <Link href="/challenges">
              <Button variant="secondary" size="default" className="text-xs font-bold">
                Find Duels
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 min-w-0">
          <WalletCard />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4 min-w-0">
          <Card className="p-4 sm:p-6 bg-card border-border shadow-xl space-y-4 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-black text-base sm:text-lg text-foreground uppercase tracking-tight">
                  Recent Match History
                </h3>
                <p className="text-xs text-muted-foreground">
                  Head-to-head duels and tournament bracket matches
                </p>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                {matches?.length ?? 0} Records
              </Badge>
            </div>

            {isLoading ? (
              <p className="text-xs text-muted-foreground py-8 text-center font-mono animate-pulse">
                Querying match history records...
              </p>
            ) : matches && matches.length > 0 ? (
              <div className="divide-y divide-border overflow-x-hidden">
                {matches.map((m) => {
                  const gameTitle = m.game_profiles?.display_name || catalogGame.displayName;
                  const catalogItem = OFFICIAL_GAMES.find(
                    (c) =>
                      c.id.toLowerCase() === m.profile_id?.toLowerCase() ||
                      c.displayName.toLowerCase() === gameTitle.toLowerCase()
                  ) || catalogGame;

                  return (
                    <div
                      key={m.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <GamePoster
                          game={catalogItem}
                          aspect="mini"
                          className="w-7 h-10 rounded-lg flex-shrink-0 border border-border"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-foreground truncate">
                              {gameTitle}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              #{m.id.slice(0, 8)}
                            </span>
                            {m.room_code && (
                              <span className="px-1.5 py-0.2 bg-secondary text-muted-foreground font-mono text-[9px] rounded">
                                {m.room_code}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
                            Format: <strong className="text-foreground">{m.format}</strong> · Prize:{' '}
                            <strong className="text-accent-400">
                              {m.prize_pool > 0 ? formatEUR(m.prize_pool) : 'Glory & Elo'}
                            </strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-auto flex-shrink-0">
                        <Badge
                          variant={
                            m.status === 'SETTLED'
                              ? 'success'
                              : m.status === 'OPEN'
                              ? 'warning'
                              : 'secondary'
                          }
                          className="font-mono text-[10px]"
                        >
                          {m.status}
                        </Badge>
                        <Link href={`/matches/${m.id}`}>
                          <Button variant="secondary" size="sm" className="h-7 text-[11px] font-bold">
                            Matchroom →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <span className="text-3xl block">🎮</span>
                <p className="text-xs font-semibold">No competitive matches on record yet.</p>
                <Link href="/challenges" className="inline-block mt-2">
                  <Button variant="copper" size="sm">
                    Enter Matchmaking Queue
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
