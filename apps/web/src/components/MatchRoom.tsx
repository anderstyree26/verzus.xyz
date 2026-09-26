'use client';

import { useState, useEffect } from 'react';
import type { GameProfile } from '@antigravity/core';
import { useCapturePipeline } from '../hooks/useCapturePipeline';
import { LiveScore } from './LiveScore';
import { CalibrationTool } from './CalibrationTool';

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
  const [showCalibration, setShowCalibration] = useState(false);
  const [isReadyA, setIsReadyA] = useState(false);
  const [isReadyB, setIsReadyB] = useState(false);
  const [coinResult, setCoinResult] = useState<'A' | 'B' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [copied, setCopied] = useState(false);

  const capture = useCapturePipeline(matchId, profile);
  const isParticipant = currentUserId === playerAId || currentUserId === playerBId;
  const isPlayerA = currentUserId === playerAId;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFlipCoin = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setCoinResult(Math.random() > 0.5 ? 'A' : 'B');
      setIsFlipping(false);
    }, 1000);
  };

  const toggleReady = () => {
    if (isPlayerA) {
      setIsReadyA(!isReadyA);
    } else {
      setIsReadyB(!isReadyB);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4 text-white">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12121A] p-6 border border-[#1E1E2C] rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FF5500] flex items-center justify-center font-black text-black text-xl">
            VS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#FF5500]">
                {profile.displayName}
              </span>
              <span className="text-xs text-gray-500 font-mono">({profile.platform || 'UNIVERSAL'})</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-0.5">
              VS Matchroom #{matchId.slice(0, 8)}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {roomCode && (
            <div className="flex items-center gap-2 bg-[#0C0C12] border border-[#262638] px-3 py-1.5 rounded-xl">
              <span className="text-[11px] text-gray-400 font-semibold uppercase">Code:</span>
              <span className="font-mono text-sm font-black text-white">{roomCode}</span>
              <button
                onClick={handleCopyLink}
                className="ml-1 text-[11px] text-[#FF5500] hover:underline font-bold"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          )}

          <div className="px-3.5 py-1.5 bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] font-black text-xs uppercase tracking-wider rounded-xl">
            {capture.status !== 'IDLE' ? capture.status : status}
          </div>
        </div>
      </div>

      {/* FACEIT Head-to-Head Roster Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-[#0C0C12] border border-[#1E1E2C] p-6 rounded-2xl">
        {/* Side A */}
        <div className="flex flex-col items-center md:items-start p-4 bg-[#12121A] border border-[#1E1E2C] rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded bg-[#FF5500] text-black font-black text-xs flex items-center justify-center">
              A
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Host / Challenger</span>
          </div>
          <div className="font-mono text-sm font-bold text-white truncate max-w-[200px]">
            {playerAId.slice(0, 12)}...
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
              <span className="px-2 py-0.5 bg-[#FF5500] text-black text-[10px] font-black rounded uppercase">
                Coin Winner
              </span>
            )}
          </div>
        </div>

        {/* Center VS & Controls */}
        <div className="flex flex-col items-center justify-center text-center p-2">
          <div className="text-3xl font-black tracking-tighter text-[#FF5500] drop-shadow-[0_0_12px_rgba(255,85,0,0.5)]">
            VS
          </div>
          <div className="text-xs text-gray-400 font-mono mt-1">BEST OF 1</div>

          {/* Interactive Ready & Coin Toss Actions */}
          {isParticipant && (
            <div className="mt-4 flex flex-col gap-2 w-full max-w-[220px]">
              <button
                onClick={toggleReady}
                className={`py-2 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition ${
                  (isPlayerA ? isReadyA : isReadyB)
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-[#FF5500] hover:bg-[#FF661A] text-black'
                }`}
              >
                {(isPlayerA ? isReadyA : isReadyB) ? 'Ready Confirmed' : 'Mark Ready'}
              </button>

              <button
                onClick={handleFlipCoin}
                disabled={isFlipping}
                className="py-1.5 px-3 bg-[#1E1E2C] hover:bg-[#262638] text-gray-300 hover:text-white rounded-lg text-[11px] font-bold transition disabled:opacity-50"
              >
                {isFlipping ? 'Flipping...' : '🪙 Flip Coin for Side/Host'}
              </button>
            </div>
          )}
        </div>

        {/* Side B */}
        <div className="flex flex-col items-center md:items-end p-4 bg-[#12121A] border border-[#1E1E2C] rounded-xl text-right">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Opponent / Squad</span>
            <span className="w-6 h-6 rounded bg-white/20 text-white font-black text-xs flex items-center justify-center">
              B
            </span>
          </div>
          <div className="font-mono text-sm font-bold text-white truncate max-w-[200px]">
            {playerBId ? `${playerBId.slice(0, 12)}...` : 'Awaiting Opponent...'}
          </div>
          <div className="mt-3 flex items-center gap-2">
            {coinResult === 'B' && (
              <span className="px-2 py-0.5 bg-[#FF5500] text-black text-[10px] font-black rounded uppercase">
                Coin Winner
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

      {/* Live OCR Scoreboard */}
      <LiveScore matchId={matchId} />

      {/* Capture Control & Anti-Cheat OCR Pipeline */}
      {isParticipant && (
        <div className="p-6 bg-[#12121A] border border-[#1E1E2C] rounded-2xl flex flex-col gap-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] animate-ping" />
                <h3 className="text-lg font-black tracking-tight text-white">Client-Side OCR Verification</h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Share your active game window. Our computer vision pipeline automatically extracts match outcomes directly in your browser.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowCalibration(!showCalibration)}
                className="px-3 py-2 bg-[#161622] hover:bg-[#1E1E2C] text-xs font-bold rounded-xl border border-[#262638] text-gray-300 hover:text-white transition"
              >
                {showCalibration ? 'Close Calibration' : '🎯 Calibrate ROI'}
              </button>

              {capture.status === 'CAPTURING' ? (
                <button
                  onClick={capture.stopCapture}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-600/20"
                >
                  Stop & Settle Match
                </button>
              ) : (
                <button
                  onClick={capture.startCapture}
                  className="px-5 py-2.5 bg-[#FF5500] hover:bg-[#FF661A] text-black font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-[#FF5500]/25"
                >
                  Start Screen Capture
                </button>
              )}
            </div>
          </div>

          {showCalibration && (
            <CalibrationTool
              initialRoi={profile.roi}
              onSave={(newRoi) => {
                profile.roi = newRoi;
                setShowCalibration(false);
              }}
            />
          )}

          {capture.lastScore && (
            <div className="flex items-center justify-between p-3.5 bg-[#0C0C12] rounded-xl border border-[#1E1E2C] text-xs font-mono">
              <span className="text-gray-400">
                Latest OCR Outcome: <strong className="text-white text-sm">{capture.lastScore}</strong>
              </span>
              <span className="text-gray-400">
                Anti-Cheat Confidence:{' '}
                <strong className="text-[#FF5500]">{(capture.confidence * 100).toFixed(1)}%</strong>
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
