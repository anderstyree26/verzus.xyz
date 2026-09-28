'use client';

import { useState, useRef, useEffect } from 'react';
import { useCapturePipeline } from '../hooks/useCapturePipeline';
import { LiveScore } from './LiveScore';
import { notifyUser, requestNotificationPermission } from '../lib/notifications';
import { useGameAccountsStore } from '../lib/gameAccountsStore';
import { getGameById } from '../lib/gamesCatalog';
import { GamePoster } from './GamePoster';
import { MatchPermissionsModal } from './MatchPermissionsModal';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { GameProfile } from '@antigravity/core';

export interface MatchRoomProps {
  matchId: string;
  profile: GameProfile;
  playerAId: string;
  playerBId?: string | null;
  currentUserId: string;
  status: string;
  roomCode?: string | null;
}

export function MatchRoom({
  matchId,
  profile,
  playerAId,
  playerBId,
  currentUserId,
  status,
  roomCode,
}: MatchRoomProps) {
  const [editingTag, setEditingTag] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTagA, setCopiedTagA] = useState(false);
  const [copiedTagB, setCopiedTagB] = useState(false);
  const [coinResult, setCoinResult] = useState<'A' | 'B' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isReadyA, setIsReadyA] = useState(false);
  const [isReadyB, setIsReadyB] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);

  // In-Game Gamertag account store
  const { getGamertag, getGamertagLabel, setGamertag } = useGameAccountsStore();
  const gameTagLabel = getGamertagLabel(profile.id);
  const myGamertag = getGamertag(profile.id);
  const catalogGame = getGameById(profile.id);

  const isPlayerA = currentUserId === playerAId;
  const isPlayerB = Boolean(playerBId && currentUserId === playerBId);
  const isParticipant = isPlayerA || isPlayerB;

  // Background automated game sync pipeline
  const capture = useCapturePipeline(matchId, profile);

  // Track state transitions to trigger reactive audio / push alerts
  const prevPlayerB = useRef<string | null | undefined>(playerBId);
  const prevCaptureStatus = useRef<string>(capture.status);
  const prevScore = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsGranted(Notification.permission === 'granted');
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsGranted(granted);
    if (granted) {
      notifyUser('Alerts Enabled', {
        body: 'You will receive sound and browser alerts for match events.',
        sound: 'score',
      });
    }
  };

  // 1. Notify on Opponent Join
  useEffect(() => {
    if (!prevPlayerB.current && playerBId) {
      notifyUser('Challenger Joined!', {
        body: 'An opponent has entered the matchroom. Check in-game gamertags and get ready!',
        sound: 'connect',
      });
    }
    prevPlayerB.current = playerBId;
  }, [playerBId]);

  // 2. Notify on Screen Connected & Background OCR Active
  useEffect(() => {
    if (prevCaptureStatus.current !== 'CAPTURING' && capture.status === 'CAPTURING') {
      notifyUser('Game Window Connected!', {
        body: `${profile.displayName} window captured. Score verification is active in the background. Good luck!`,
        sound: 'connect',
      });
    }
    if (prevCaptureStatus.current !== 'ENDED' && capture.status === 'ENDED') {
      notifyUser('Match Concluded & Settled!', {
        body: 'Game outcome has been verified. Payouts and Elo standings updated!',
        sound: 'victory',
      });
    }
    prevCaptureStatus.current = capture.status;
  }, [capture.status, profile.displayName]);

  // 3. Notify on score progress
  useEffect(() => {
    if (capture.lastScore && capture.lastScore !== prevScore.current) {
      if (document.hidden) {
        notifyUser('Score Progression Update', {
          body: `Latest verified score: ${capture.lastScore}`,
          sound: 'score',
        });
      }
      prevScore.current = capture.lastScore;
    }
  }, [capture.lastScore]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyTag = (tag: string, side: 'A' | 'B') => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(tag);
      if (side === 'A') {
        setCopiedTagA(true);
        setTimeout(() => setCopiedTagA(false), 2000);
      } else {
        setCopiedTagB(true);
        setTimeout(() => setCopiedTagB(false), 2000);
      }
    }
  };

  const handleSaveGamertag = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagInput.trim()) {
      setGamertag(profile.id, tagInput.trim());
      setEditingTag(false);
    }
  };

  const handleFlipCoin = () => {
    setIsFlipping(true);
    setTimeout(() => {
      const res = Math.random() > 0.5 ? 'A' : 'B';
      setCoinResult(res);
      setIsFlipping(false);
      notifyUser('Coin Toss Result', {
        body: `Player ${res} won the toss for host/side selection!`,
        sound: 'score',
      });
    }, 1000);
  };

  const toggleReady = () => {
    // Before player marks ready, verify that game feed capture has been granted
    if (capture.status !== 'CAPTURING') {
      setPermissionsModalOpen(true);
      return;
    }

    if (isPlayerA) {
      const next = !isReadyA;
      setIsReadyA(next);
      if (next) notifyUser('Ready Status Confirmed', { sound: 'score' });
    } else {
      const next = !isReadyB;
      setIsReadyB(next);
      if (next) notifyUser('Ready Status Confirmed', { sound: 'score' });
    }
  };

  const playerATag = isPlayerA ? myGamertag || 'Unlinked Gamertag' : 'Host Player';
  const playerBTag = !isPlayerA && isParticipant ? myGamertag || 'Unlinked Gamertag' : 'Challenger';

  return (
    <div className="space-y-6 max-w-5xl mx-auto min-w-0">
      {/* Optional Notification Opt-In Banner */}
      {!notificationsGranted && (
        <Card className="p-4 bg-secondary/80 border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-foreground">
            <span className="text-xl">🔔</span>
            <span>
              <strong>Enable Match Alerts:</strong> Receive audio & background notifications when your opponent joins or match finishes.
            </span>
          </div>
          <Button
            onClick={handleEnableNotifications}
            variant="default"
            size="sm"
          >
            Enable Alerts
          </Button>
        </Card>
      )}

      {/* Top Header Matchroom Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-card p-6 sm:p-8 border border-border rounded-3xl shadow-xl">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <GamePoster
            game={catalogGame}
            aspect="thumb"
            className="w-14 h-18 sm:w-16 sm:h-22 rounded-2xl shadow-xl border border-border flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="copper">{profile.displayName}</Badge>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {profile.platform || 'UNIVERSAL'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground truncate">
              Arena Matchroom #{matchId.slice(0, 8)}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Connect in-game via gamertags below, coin toss for side, and play.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap sm:flex-nowrap">
          {roomCode && (
            <div className="flex items-center gap-2 bg-secondary border border-border px-3.5 py-2 rounded-xl text-xs">
              <span className="text-muted-foreground font-semibold uppercase">Room:</span>
              <span className="font-mono font-black text-foreground">{roomCode}</span>
              <button
                onClick={handleCopyLink}
                className="ml-1 text-accent-400 hover:underline font-bold"
              >
                {copiedLink ? '✓ Copied' : 'Share'}
              </button>
            </div>
          )}

          {/* Permissions Status Capsule */}
          {isParticipant && (
            <button
              type="button"
              onClick={() => setPermissionsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/80 hover:bg-secondary border border-border text-xs transition"
              title="Click to check or update game feed and notification permissions"
            >
              <span className={`w-2 h-2 rounded-full ${capture.status === 'CAPTURING' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              <span className="font-mono text-[10px] text-muted-foreground uppercase">
                Feed: <strong className="text-foreground">{capture.status === 'CAPTURING' ? 'LIVE' : 'SETUP'}</strong>
              </span>
              <span className="text-muted-foreground/40">|</span>
              <span className="font-mono text-[10px] text-muted-foreground uppercase">
                Alerts: <strong className="text-foreground">{notificationsGranted ? 'ON' : 'OFF'}</strong>
              </span>
            </button>
          )}

          <Badge variant={capture.status === 'CAPTURING' ? 'success' : 'copper'} className="py-1 px-3 text-xs">
            {capture.status === 'CAPTURING' ? '● VERIFYING LIVE' : status}
          </Badge>
        </div>
      </div>

      {/* Head-to-Head Competitor Roster with In-Game Gamertags */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-card border border-border p-6 rounded-3xl shadow-xl">
        {/* Side A (Host) */}
        <Card className="flex flex-col items-center md:items-start p-5 bg-secondary/60 border-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground font-black text-xs flex items-center justify-center shadow-sm">
              A
            </span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Host Competitor</span>
          </div>

          <div className="font-mono text-sm font-bold text-foreground truncate max-w-[200px]">
            {isPlayerA ? 'You (@Host)' : `Player #${playerAId.slice(0, 8)}`}
          </div>

          {/* Verified In-Game Gamertag */}
          <div className="mt-3 p-2.5 bg-background border border-border rounded-xl w-full flex items-center justify-between text-xs">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] text-muted-foreground font-bold uppercase">{gameTagLabel}</span>
              <span className="font-mono font-bold text-foreground truncate max-w-[120px]">{playerATag}</span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleCopyTag(playerATag, 'A')}
              className="h-7 px-2 text-[10px]"
            >
              {copiedTagA ? '✓' : 'Copy'}
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Badge variant={isReadyA ? 'success' : 'warning'}>
              {isReadyA ? '✓ READY' : '⏳ NOT READY'}
            </Badge>
            {coinResult === 'A' && (
              <Badge variant="copper">Host Pick</Badge>
            )}
          </div>
        </Card>

        {/* Center VS & Coin Toss Actions */}
        <div className="flex flex-col items-center justify-center text-center p-2">
          <div className="text-3xl sm:text-4xl font-black tracking-tighter text-accent-400">
            VS
          </div>
          <div className="text-xs text-muted-foreground font-mono mt-0.5">BEST OF 1 DUEL</div>

          {isParticipant && (
            <div className="mt-4 flex flex-col gap-2.5 w-full max-w-[220px]">
              <Button
                onClick={toggleReady}
                variant={(isPlayerA ? isReadyA : isReadyB) ? 'outline' : 'default'}
                className="w-full"
              >
                {(isPlayerA ? isReadyA : isReadyB) ? '✓ Ready Confirmed' : 'Mark Ready'}
              </Button>

              <Button
                onClick={handleFlipCoin}
                disabled={isFlipping}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                {isFlipping ? 'Flipping...' : '🪙 Coin Toss for Host/Map'}
              </Button>
            </div>
          )}
        </div>

        {/* Side B (Opponent) */}
        <Card className="flex flex-col items-center md:items-end p-5 bg-secondary/60 border-border text-right">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Challenger</span>
            <span className="w-7 h-7 rounded-lg bg-secondary border border-border text-foreground font-black text-xs flex items-center justify-center shadow-sm">
              B
            </span>
          </div>

          <div className="font-mono text-sm font-bold text-foreground truncate max-w-[200px]">
            {playerBId ? (!isPlayerA ? 'You (@Challenger)' : `Player #${playerBId.slice(0, 8)}`) : 'Waiting for Opponent...'}
          </div>

          {/* Opponent In-Game Gamertag */}
          <div className="mt-3 p-2.5 bg-background border border-border rounded-xl w-full flex items-center justify-between text-xs text-left">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleCopyTag(playerBTag, 'B')}
              className="h-7 px-2 text-[10px]"
            >
              {copiedTagB ? '✓' : 'Copy'}
            </Button>
            <div className="flex flex-col text-right min-w-0">
              <span className="text-[9px] text-muted-foreground font-bold uppercase">{gameTagLabel}</span>
              <span className="font-mono font-bold text-foreground truncate max-w-[120px]">{playerBTag}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {coinResult === 'B' && (
              <Badge variant="copper">Host Pick</Badge>
            )}
            <Badge variant={playerBId ? (isReadyB ? 'success' : 'warning') : 'secondary'}>
              {playerBId ? (isReadyB ? '✓ READY' : '⏳ NOT READY') : 'VACANT'}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Gamertag Setup Prompt */}
      {isParticipant && !myGamertag && !editingTag && (
        <Card className="p-5 bg-amber-500/10 border-amber-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-amber-200">
            <span className="text-xl">🎮</span>
            <span>
              <strong>Link your {gameTagLabel}:</strong> Connect your in-game handle so your opponent can invite you to the live match lobby.
            </span>
          </div>
          <Button
            onClick={() => setEditingTag(true)}
            variant="default"
            size="sm"
          >
            + Set Handle
          </Button>
        </Card>
      )}

      {editingTag && (
        <form onSubmit={handleSaveGamertag} className="p-4 bg-card border border-border rounded-2xl flex items-center gap-3 text-xs">
          <span className="text-foreground font-bold">{gameTagLabel}:</span>
          <Input
            type="text"
            placeholder="e.g. s1mple_pro"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="flex-1 font-mono"
            autoFocus
          />
          <Button type="submit" variant="default" size="sm">
            Save
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditingTag(false)}>
            Cancel
          </Button>
        </form>
      )}

      {/* Clean Live Head-to-Head Scoreboard */}
      <LiveScore matchId={matchId} />

      {/* Seamless Background Verification (ZERO Technical Bounding Box Clutter) */}
      {isParticipant && (
        <Card className="p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${capture.status === 'CAPTURING' ? 'bg-emerald-500 animate-pulse' : 'bg-primary'}`} />
                <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground">
                  {capture.status === 'CAPTURING' ? 'Game Window Connected & Active' : 'Automatic Match Verification'}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {capture.status === 'CAPTURING'
                  ? 'All scores and victory conditions are automatically tracked in the background. Simply play your game.'
                  : 'Select your game window once. Results are verified automatically without any manual score entry.'}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {capture.status === 'CAPTURING' ? (
                <Button
                  onClick={capture.stopCapture}
                  variant="destructive"
                  size="default"
                >
                  Conclude & Settle
                </Button>
              ) : (
                <Button
                  onClick={() => setPermissionsModalOpen(true)}
                  variant="default"
                  size="lg"
                  className="gap-2"
                >
                  <span>📺</span>
                  <span>Connect Game Window</span>
                </Button>
              )}
            </div>
          </div>

          {/* Background Running Status Banner */}
          {capture.status === 'CAPTURING' && (
            <div className="p-3.5 bg-background border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-emerald-400 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Anti-Cheat Verification Active
              </span>
              <span className="text-muted-foreground text-xs font-mono">
                {capture.lastScore ? `Live HUD: "${capture.lastScore}"` : 'Listening for match outcome...'}
              </span>
            </div>
          )}

          {capture.error && (
            <div className="p-3.5 bg-destructive/15 border border-destructive/30 text-destructive text-xs rounded-xl">
              {capture.error}
            </div>
          )}
        </Card>
      )}

      {/* Pre-Match Cross-Platform Permissions Modal */}
      <MatchPermissionsModal
        open={permissionsModalOpen}
        onClose={() => setPermissionsModalOpen(false)}
        onComplete={() => {
          if (isPlayerA) setIsReadyA(true);
          else setIsReadyB(true);
          notifyUser('Permissions Verified & Ready!', { sound: 'score' });
        }}
        gameName={profile.displayName}
        isCapturing={capture.status === 'CAPTURING'}
        onStartCapture={capture.startCapture}
        notificationsGranted={notificationsGranted}
        onRequestNotifications={async () => {
          const granted = await requestNotificationPermission();
          setNotificationsGranted(granted);
          return granted;
        }}
      />
    </div>
  );
}
