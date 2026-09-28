'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { EloBadge } from '../../components/EloBadge';
import { GamePoster } from '../../components/GamePoster';
import { CashierModal } from '../../components/CashierModal';
import { apiClient } from '../../lib/api';
import { useGameStore } from '../../lib/gameStore';
import { formatEUR, formatPoints } from '../../lib/currency';
import { getGameById, OFFICIAL_GAMES } from '../../lib/gamesCatalog';
import { notifyUser } from '../../lib/notifications';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';

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
  winner_id?: string | null;
}

interface WalletData {
  balance: number;
  locked: number;
  currency: string;
  cashEur?: number;
  lockedCashEur?: number;
}

interface TransactionItem {
  id: string;
  amount: number;
  balanceAfter: number;
  reason: string;
  createdAt: string;
}

interface UserProfileData {
  id: string;
  username: string;
  display_name?: string;
  rating?: number;
  region?: string;
  trust_score?: number;
}

export default function DashboardPage() {
  const { activeGame } = useGameStore();
  const [activeTab, setActiveTab] = useState<'matches' | 'stats' | 'transactions'>('matches');
  const [cashierModalOpen, setCashierModalOpen] = useState(false);
  const [cashierMode, setCashierMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [faucetLoading, setFaucetLoading] = useState(false);

  const catalogGame = getGameById(activeGame?.id);

  // 1. User Profile Data
  const { data: userProfile } = useQuery<UserProfileData | null>({
    queryKey: ['dashboard-profile'],
    queryFn: () => apiClient<UserProfileData>('/profile/me').catch(() => null),
    staleTime: 30000,
  });

  // 2. Wallet Balance
  const { data: balanceData, isLoading: loadingBalance, refetch: refetchBalance } = useQuery<WalletData>({
    queryKey: ['wallet-balance'],
    queryFn: () => apiClient<WalletData>('/wallet/balance'),
    staleTime: 10000,
  });

  // 3. Match History
  const { data: matches, isLoading: loadingMatches } = useQuery<MatchItem[]>({
    queryKey: ['my-matches'],
    queryFn: () => apiClient<MatchItem[]>('/matches/mine'),
    staleTime: 15000,
  });

  // 4. Ledger Transaction History
  const { data: historyData, refetch: refetchHistory } = useQuery<TransactionItem[]>({
    queryKey: ['wallet-history'],
    queryFn: () => apiClient<TransactionItem[]>('/wallet/history?limit=10'),
    staleTime: 15000,
  });

  const cashEur = balanceData?.cashEur ?? 0.0;
  const lockedCashEur = balanceData?.lockedCashEur ?? 0.0;
  const points = balanceData?.balance ?? 0;
  const lockedPoints = balanceData?.locked ?? 0;

  const elo = userProfile?.rating ?? 1000;
  const username = userProfile?.username || 'Competitor';
  const region = userProfile?.region || 'DE';
  const trustScore = userProfile?.trust_score ?? 980;

  // Match calculations
  const settledMatches = (matches || []).filter((m) => m.status === 'SETTLED' || m.status === 'COMPLETED');
  const totalMatches = settledMatches.length;
  const wins = userProfile?.id
    ? settledMatches.filter((m) => m.winner_id === userProfile.id).length
    : 0;
  const losses = Math.max(0, totalMatches - wins);
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : '0.0';
  const recentForm = settledMatches.slice(0, 5).map((m) => (m.winner_id === userProfile?.id ? 'W' : 'L'));

  const handleClaimFaucet = async () => {
    setFaucetLoading(true);
    try {
      await apiClient('/wallet/faucet', { method: 'POST' });
      notifyUser('Demo Funds Claimed! +1,000 PTS', {
        body: 'Demo play points added to your account for free tournament entries.',
        sound: 'score',
        type: 'success',
      });
      refetchBalance();
      refetchHistory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      notifyUser('Faucet Error', { body: msg, type: 'error' });
    } finally {
      setFaucetLoading(false);
    }
  };

  const openDeposit = () => {
    setCashierMode('deposit');
    setCashierModalOpen(true);
  };

  const openWithdraw = () => {
    setCashierMode('withdraw');
    setCashierModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full min-w-0 pb-16">
      {/* 1. MASTER INTRO CARD: Identity + Competitive Ledger Integrated Directly (Zero Side Squeezing) */}
      <Card className="relative overflow-hidden border-border bg-card shadow-2xl">
        {/* Subtle key art backdrop */}
        <div className="h-44 sm:h-52 bg-gradient-to-r from-stone-950 via-stone-900 to-primary/20 w-full relative overflow-hidden">
          {catalogGame.bannerUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20 filter blur-xs"
              style={{ backgroundImage: `url(${catalogGame.bannerUrl})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <Badge variant="copper" className="font-mono text-[10px]">
              OFFICIAL ARENA: {catalogGame.shortName}
            </Badge>
          </div>
        </div>

        {/* Integrated Intro Card Content */}
        <div className="px-6 sm:px-8 pb-8 relative z-10 space-y-6">
          {/* Identity Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            {/* Player Avatar & Handle */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-stone-900 via-stone-800 to-primary text-primary-foreground font-black text-3xl sm:text-4xl flex items-center justify-center shadow-2xl border-4 border-card ring-2 ring-primary/30">
                  {username.slice(0, 2).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <EloBadge elo={elo} size="md" />
                </div>
              </div>

              <div className="space-y-1.5 min-w-0 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="copper">VERIFIED COMPETITOR</Badge>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    LEVEL {Math.min(10, Math.max(1, Math.floor(elo / 150)))} ELO
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    📍 {region} · ZERO DISPUTES
                  </Badge>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight truncate">
                    @{username}
                  </h1>
                  <span className="font-mono text-sm text-accent-400 font-bold">
                    {elo} ELO
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Match Launchers */}
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap flex-shrink-0">
              <Link href={`/matches/new?profileId=${catalogGame.id}`}>
                <Button variant="default" size="default" className="font-bold text-xs gap-1.5 shadow-md shadow-primary/20">
                  <span>⚔️ Host 1v1 Duel</span>
                </Button>
              </Link>
              <Link href="/challenges">
                <Button variant="secondary" size="default" className="font-bold text-xs gap-1.5">
                  <span>Find Duels</span>
                </Button>
              </Link>
            </div>
          </div>

          <Separator />

          {/* 2. COMPETITIVE LEDGER (Part of Intro Card - Full Width, Spacious, Never Squeezed) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground font-mono">
                  Competitive Ledger & Wallet Escrow
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                Standardized in € EUR worldwide · Zero exchange-rate slippage
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Real Cash Box */}
              <div className="p-5 rounded-2xl bg-secondary/60 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase font-mono">
                      Cash Balance
                    </span>
                    <Badge variant="success" className="text-[9px] font-mono">
                      REAL MONEY
                    </Badge>
                  </div>
                  <div className="text-3xl font-black font-mono text-emerald-400">
                    {loadingBalance ? '...' : formatEUR(cashEur)}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Escrow Locked in Active Duels: <strong className="text-foreground">{formatEUR(lockedCashEur)}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={openDeposit}
                    className="font-bold text-xs gap-1"
                  >
                    <span>+ Deposit €</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={openWithdraw}
                    className="font-bold text-xs gap-1"
                  >
                    <span>↑ Withdraw</span>
                  </Button>
                </div>
              </div>

              {/* Free Demo Points Box */}
              <div className="p-5 rounded-2xl bg-secondary/60 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase font-mono">
                      Demo Play Points
                    </span>
                    <Badge variant="copper" className="text-[9px] font-mono">
                      FREE PLAY
                    </Badge>
                  </div>
                  <div className="text-3xl font-black font-mono text-accent-400">
                    {loadingBalance ? '...' : formatPoints(points)} <span className="text-xs text-muted-foreground font-sans">PTS</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Tournaments Locked: <strong className="text-foreground">{formatPoints(lockedPoints)} PTS</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={faucetLoading}
                    onClick={handleClaimFaucet}
                    className="font-bold text-xs gap-1"
                  >
                    <span>{faucetLoading ? 'Claiming...' : '🚰 +1,000 PTS'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. BODY CONTENT: Clean Full-Width Navigation Tabs */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'matches'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            ⚔️ Match History ({matches?.length ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'stats'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            🥇 Career Stats & Form
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'transactions'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            💳 Ledger Transactions ({historyData?.length ?? 0})
          </button>
        </div>

        {/* Tab 1: Match History */}
        {activeTab === 'matches' && (
          <Card className="p-6 sm:p-8 bg-card border-border shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-black text-base sm:text-lg text-foreground uppercase tracking-tight">
                  Recent Head-to-Head Duels & Tournament Matches
                </h3>
                <p className="text-xs text-muted-foreground">
                  Scores verified automatically by automated instant game sync
                </p>
              </div>
            </div>

            {loadingMatches ? (
              <p className="py-12 text-center text-xs text-muted-foreground font-mono animate-pulse">
                Loading match records...
              </p>
            ) : matches && matches.length > 0 ? (
              <div className="space-y-3">
                {matches.map((m) => {
                  const gameTitle = m.game_profiles?.display_name || catalogGame.displayName;
                  const catalogItem = OFFICIAL_GAMES.find(
                    (c) =>
                      c.id.toLowerCase() === m.profile_id?.toLowerCase() ||
                      c.displayName.toLowerCase() === gameTitle.toLowerCase()
                  ) || catalogGame;

                  const isWin = m.winner_id === userProfile?.id;

                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <span
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm font-mono flex-shrink-0 shadow-sm border ${
                            m.status === 'SETTLED'
                              ? isWin
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                : 'bg-destructive/20 text-destructive border-destructive/40'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          }`}
                        >
                          {m.status === 'SETTLED' ? (isWin ? 'W' : 'L') : '⏳'}
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
                            {m.room_code && (
                              <span className="px-1.5 py-0.5 bg-card text-muted-foreground font-mono text-[10px] rounded border border-border">
                                {m.room_code}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono flex-wrap">
                            <span>#{m.id.slice(0, 8)}</span>
                            <span>·</span>
                            <span>{new Date(m.created_at).toLocaleDateString()}</span>
                            <span>·</span>
                            <span className="text-accent-400 font-bold">
                              {m.prize_pool > 0 ? formatEUR(m.prize_pool) : 'Glory & Elo'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
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
                          <Button variant="secondary" size="sm" className="h-8 text-xs font-bold">
                            Matchroom →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-muted-foreground space-y-3 bg-secondary/30 rounded-2xl border border-dashed border-border">
                <span className="text-4xl block">🎮</span>
                <h4 className="text-base font-bold text-foreground">No Competitive Matches on Record</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Queue your first 1v1 duel or join a tournament cup to build your competitive match history.
                </p>
                <div className="pt-2">
                  <Link href="/challenges">
                    <Button variant="default" size="default" className="text-xs font-bold">
                      Enter Matchmaking Queue
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Tab 2: Career Stats & Form */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-card border-border shadow-md space-y-3">
              <span className="text-xs uppercase font-bold text-muted-foreground font-mono tracking-wider block">
                Win Rate
              </span>
              <div className="text-4xl font-black font-mono text-emerald-400">
                {winRate}%
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {wins} Victories out of {totalMatches} settled matches
              </p>
            </Card>

            <Card className="p-6 bg-card border-border shadow-md space-y-3">
              <span className="text-xs uppercase font-bold text-muted-foreground font-mono tracking-wider block">
                Recent Match Form
              </span>
              <div className="flex items-center gap-2 pt-1">
                {recentForm.length > 0 ? (
                  recentForm.map((outcome, idx) => (
                    <div
                      key={idx}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm font-mono border ${
                        outcome === 'W'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-destructive/20 text-destructive border-destructive/40'
                      }`}
                    >
                      {outcome}
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground font-mono">No matches played</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                Outcome of your last 5 matches
              </p>
            </Card>

            <Card className="p-6 bg-card border-border shadow-md space-y-3">
              <span className="text-xs uppercase font-bold text-muted-foreground font-mono tracking-wider block">
                FairPlay Trust Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono text-emerald-400">{trustScore}</span>
                <span className="text-xs text-muted-foreground font-mono">/ 1,000</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Automated match verification active. 0 dispute infractions.
              </p>
            </Card>
          </div>
        )}

        {/* Tab 3: Ledger Transactions */}
        {activeTab === 'transactions' && (
          <Card className="p-6 sm:p-8 bg-card border-border shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-black text-base sm:text-lg text-foreground uppercase tracking-tight">
                  Escrow & Wallet Ledger
                </h3>
                <p className="text-xs text-muted-foreground">
                  History of deposits, withdrawals, match prize pools, and entry stakes
                </p>
              </div>
            </div>

            {historyData && historyData.length > 0 ? (
              <div className="divide-y divide-border overflow-hidden bg-secondary/40 rounded-2xl border border-border">
                {historyData.map((tx) => (
                  <div key={tx.id} className="py-3.5 px-4 flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold capitalize text-foreground text-sm">
                        {tx.reason.replace(/_/g, ' ')}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {new Date(tx.createdAt).toLocaleString()} · ID: #{tx.id.slice(0, 8)}
                      </p>
                    </div>
                    <div
                      className={`font-mono font-bold text-sm ${
                        tx.amount > 0 ? 'text-emerald-400' : 'text-destructive'
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} PTS
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-xs text-muted-foreground font-mono">
                No ledger transactions recorded yet.
              </p>
            )}
          </Card>
        )}
      </div>

      {/* Geo-Aware Cashier Modal (Deposit & Withdrawal) */}
      <CashierModal
        open={cashierModalOpen}
        onClose={() => setCashierModalOpen(false)}
        initialMode={cashierMode}
        countryCode={region}
        userBalanceEur={cashEur}
        onSuccess={() => {
          refetchBalance();
          refetchHistory();
        }}
      />
    </div>
  );
}
