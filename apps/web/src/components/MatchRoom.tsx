'use client';

import { useState, useEffect, useRef } from 'react';
import type { GameProfile } from '@antigravity/core';
import { useCapturePipeline } from '../hooks/useCapturePipeline';
import { LiveScore } from './LiveScore';
import { notifyUser, requestNotificationPermission } from '../lib/notifications';
import { useGameAccountsStore } from '../lib/gameAccountsStore';

interface MatchRoomProps {
  matchId: string;
  profile: GameProfile;
  playerAId: string;
  playerBId: string | null;
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
  const [isReadyA, setIsReadyA] = useState(false);
  const [isReadyB, setIsReadyB] = useState(false);
  const [coinResult, setCoinResult] = useState<'A' | 'B' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTagA, setCopiedTagA] = useState(false);
  const [copiedTagB, setCopiedTagB] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);

  // In-Game Gamertag Store
  const { getGamertag, getGamertagLabel, setGamertag } = useGameAccountsStore();
  const gameTagLabel = getGamertagLabel(profile.id);
  const myGamertag = getGamertag(profile.id);
  const [editingTag, setEditingTag] = useState(false);
  const [tagInput, setTagInput] = useState(myGamertag || '');

  const capture = useCapturePipeline(matchId, profile);
  const isParticipant = currentUserId === playerAId || currentUserId === playerBId;
  const isPlayerA = currentUserId === playerAId;

  // Previous status tracker for reactive notifications
  const prevCaptureStatus = useRef(capture.status);
  const prevPlayerB = useRef(playerBId);
  const prevScore = useRef(capture.lastScore);

  // Check initial notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsGranted(Notification.permission === 'granted');
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsGranted(granted);
    if (granted) {
      notifyUser('Notifications Enabled', {
        body: 'You will receive audio and desktop alerts when opponent joins and when the match settles!',
        sound: 'connect',
      });
    }
  };

  // 1. Notify on opponent joined
  useEffect(() => {
    if (!prevPlayerB.current && playerBId) {
      notifyUser('Opponent Connected!', {
        body: 'Your rival has entered the matchroom. Check in and mark READY to begin.',
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
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-2 sm:p-4 text-white">
      {/* Optional Notification Opt-In Banner */}
      {!notificationsGranted && (
        <div className="p-3 bg-[#161922] border border-[#202430] rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-base">🔔</span>
            <span>
              <strong>Enable Match Alerts:</strong> Receive audio & background notifications when your opponent joins or match finishes.
            </span>
          </div>
          <button
            onClick={handleEnableNotifications}
            className="px-3 py-1.5 bg-[#C86228] hover:bg-[#D97736] font-bold text-white rounded-lg transition text-[11px]"
          >
            Enable Alerts
          </button>
        </div>
      )}

      {/* Top Header Matchroom Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111319] p-5 sm:p-6 border border-[#202430] rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#C86228] flex items-center justify-center font-black text-white text-lg shadow-sm">
            VX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D97736]">
                {profile.displayName}
              </span>
              <span className="text-xs text-gray-500 font-mono">({profile.platform || 'UNIVERSAL'})</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
              Arena Matchroom #{matchId.slice(0, 8)}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {roomCode && (
            <div className="flex items-center gap-2 bg-[#161922] border border-[#202430] px-3 py-1.5 rounded-xl">
              <span className="text-[11px] text-gray-400 font-semibold uppercase">Room Code:</span>
              <span className="font-mono text-sm font-black text-white">{roomCode}</span>
              <button
                onClick={handleCopyLink}
                className="ml-1 text-[11px] text-[#D97736] hover:underline font-bold"
              >
                {copiedLink ? '✓ Copied' : 'Share'}
              </button>
            </div>
          )}

          <div className="px-3.5 py-1.5 bg-[#C86228]/15 border border-[#C86228]/30 text-[#D97736] font-bold text-xs uppercase tracking-wider rounded-xl">
            {capture.status === 'CAPTURING' ? '● VERIFYING LIVE' : status}
          </div>
        </div>
      </div>

      {/* Head-to-Head Competitor Roster with In-Game Gamertags */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-[#0B0C10] border border-[#202430] p-5 sm:p-6 rounded-2xl">
        {/* Side A (Host) */}
        <div className="flex flex-col items-center md:items-start p-4 bg-[#111319] border border-[#202430] rounded-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-6 rounded bg-[#C86228] text-white font-black text-xs flex items-center justify-center">
              A
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Host Competitor</span>
          </div>

          <div className="font-mono text-sm font-bold text-white truncate max-w-[200px]">
            {isPlayerA ? 'You (@Host)' : `Player #${playerAId.slice(0, 8)}`}
          </div>

          {/* Verified In-Game Gamertag */}
          <div className="mt-2 p-2 bg-[#0B0C10] border border-[#202430] rounded-lg w-full flex items-center justify-between text-xs">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 font-bold uppercase">{gameTagLabel}</span>
              <span className="font-mono font-bold text-white truncate max-w-[120px]">{playerATag}</span>
            </div>
            <button
              onClick={() => handleCopyTag(playerATag, 'A')}
              className="px-2 py-1 bg-[#161922] hover:bg-[#202430] border border-[#202430] rounded text-[10px] text-gray-300 font-bold"
            >
              {copiedTagA ? '✓' : 'Copy'}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`px-2.5 py-1 text-[11px] font-black uppercase rounded-lg border ${
                isReadyA
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
              }`}
            >
              {isReadyA ? '✓ READY' : '⏳ NOT READY'}
            </span>
            {coinResult === 'A' && (
              <span className="px-2 py-0.5 bg-[#C86228] text-white text-[10px] font-bold rounded uppercase">
                Host Pick
              </span>
            )}
          </div>
        </div>

        {/* Center VS & Coin Toss Actions */}
        <div className="flex flex-col items-center justify-center text-center p-2">
          <div className="text-3xl sm:text-4xl font-black tracking-tighter text-[#D97736]">
            VS
          </div>
          <div className="text-xs text-gray-400 font-mono mt-0.5">BEST OF 1 DUEL</div>

          {isParticipant && (
            <div className="mt-4 flex flex-col gap-2 w-full max-w-[220px]">
              <button
                onClick={toggleReady}
                className={`py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                  (isPlayerA ? isReadyA : isReadyB)
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-[#C86228] hover:bg-[#D97736] text-white shadow-sm'
                }`}
              >
                {(isPlayerA ? isReadyA : isReadyB) ? 'Ready Confirmed' : 'Mark Ready'}
              </button>

              <button
                onClick={handleFlipCoin}
                disabled={isFlipping}
                className="py-1.5 px-3 bg-[#161922] hover:bg-[#202430] border border-[#202430] text-gray-300 hover:text-white rounded-lg text-[11px] font-bold transition disabled:opacity-50"
              >
                {isFlipping ? 'Flipping...' : '🪙 Coin Toss for Host/Map'}
              </button>
            </div>
          )}
        </div>

        {/* Side B (Opponent) */}
        <div className="flex flex-col items-center md:items-end p-4 bg-[#111319] border border-[#202430] rounded-xl text-right">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Challenger</span>
            <span className="w-6 h-6 rounded bg-white/20 text-white font-black text-xs flex items-center justify-center">
              B
            </span>
          </div>

          <div className="font-mono text-sm font-bold text-white truncate max-w-[200px]">
            {playerBId ? (!isPlayerA ? 'You (@Challenger)' : `Player #${playerBId.slice(0, 8)}`) : 'Waiting for Opponent...'}
          </div>

          {/* Opponent In-Game Gamertag */}
          <div className="mt-2 p-2 bg-[#0B0C10] border border-[#202430] rounded-lg w-full flex items-center justify-between text-xs text-left">
            <button
              onClick={() => handleCopyTag(playerBTag, 'B')}
              className="px-2 py-1 bg-[#161922] hover:bg-[#202430] border border-[#202430] rounded text-[10px] text-gray-300 font-bold"
            >
              {copiedTagB ? '✓' : 'Copy'}
            </button>
            <div className="flex flex-col text-right">
              <span className="text-[9px] text-gray-500 font-bold uppercase">{gameTagLabel}</span>
              <span className="font-mono font-bold text-white truncate max-w-[120px]">{playerBTag}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {coinResult === 'B' && (
              <span className="px-2 py-0.5 bg-[#C86228] text-white text-[10px] font-bold rounded uppercase">
                Host Pick
              </span>
            )}
            <span
              className={`px-2.5 py-1 text-[11px] font-black uppercase rounded-lg border ${
                isReadyB
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
              }`}
            >
              {playerBId ? (isReadyB ? '✓ READY' : '⏳ NOT READY') : 'VACANT'}
            </span>
          </div>
        </div>
      </div>

      {/* Gamertag Setup Prompt (if current user has not linked their gamertag yet) */}
      {isParticipant && !myGamertag && !editingTag && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-amber-200">
            <span>🎮</span>
            <span>
              <strong>Link your {gameTagLabel}:</strong> Connect your in-game handle so your opponent can invite you to the live match lobby.
            </span>
          </div>
          <button
            onClick={() => setEditingTag(true)}
            className="px-3 py-1.5 bg-[#C86228] hover:bg-[#D97736] font-bold text-white rounded-lg transition"
          >
            + Set Handle
          </button>
        </div>
      )}

      {editingTag && (
        <form onSubmit={handleSaveGamertag} className="p-4 bg-[#111319] border border-[#202430] rounded-xl flex items-center gap-3 text-xs">
          <span className="text-gray-300 font-bold">{gameTagLabel}:</span>
          <input
            type="text"
            placeholder="e.g. s1mple_pro"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="px-3 py-1.5 bg-[#0B0C10] border border-[#202430] rounded-lg text-white font-mono flex-1 focus:outline-none focus:border-[#C86228]"
            autoFocus
          />
          <button type="submit" className="px-4 py-1.5 bg-[#C86228] hover:bg-[#D97736] font-bold text-white rounded-lg transition">
            Save
          </button>
          <button type="button" onClick={() => setEditingTag(false)} className="text-gray-400 hover:text-white">
            Cancel
          </button>
        </form>
      )}

      {/* Clean Live Head-to-Head Scoreboard */}
      <LiveScore matchId={matchId} />

      {/* Seamless Background Verification (ZERO Technical Bounding Box Clutter) */}
      {isParticipant && (
        <div className="p-6 bg-[#111319] border border-[#202430] rounded-2xl flex flex-col gap-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${capture.status === 'CAPTURING' ? 'bg-green-500 animate-pulse' : 'bg-[#C86228]'}`} />
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {capture.status === 'CAPTURING' ? 'Game Window Connected & Active' : 'Automatic Match Verification'}
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {capture.status === 'CAPTURING'
                  ? 'All scores and victory conditions are automatically tracked in the background. Simply play your game.'
                  : 'Select your game window once. Results are verified automatically without any manual score entry.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              {capture.status === 'CAPTURING' ? (
                <button
                  onClick={capture.stopCapture}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-600/20"
                >
                  Conclude & Settle
                </button>
              ) : (
                <button
                  onClick={capture.startCapture}
                  className="px-6 py-3 bg-[#C86228] hover:bg-[#D97736] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-[#C86228]/20 flex items-center gap-2"
                >
                  <span>📺</span>
                  <span>Connect Game Window</span>
                </button>
              )}
            </div>
          </div>

          {/* Background Running Status Banner */}
          {capture.status === 'CAPTURING' && (
            <div className="p-3 bg-[#0B0C10] border border-green-500/30 rounded-xl flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-green-400 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                Anti-Cheat Verification Active
              </span>
              <span className="text-gray-400 text-[11px]">
                {capture.lastScore ? `Live HUD: "${capture.lastScore}"` : 'Listening for match outcome...'}
              </span>
            </div>
          )}

          {capture.error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs">
              {capture.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
