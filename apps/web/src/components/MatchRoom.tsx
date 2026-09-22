'use client';

import { useState } from 'react';
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
  const capture = useCapturePipeline(matchId, profile);

  const isParticipant = currentUserId === playerAId || currentUserId === playerBId;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4">
      {/* Header Info */}
      <div className="flex items-center justify-between bg-surface-elevated p-5 border border-surface-border rounded-lg">
        <div>
          <span className="text-xs text-accent font-semibold uppercase tracking-wider">{profile.displayName}</span>
          <h1 className="text-2xl font-bold mt-0.5">Match #{matchId.slice(0, 8)}</h1>
          {roomCode && (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-gray-400">Room Code:</span>
              <span className="px-2 py-0.5 bg-white/10 font-mono text-sm rounded font-bold">{roomCode}</span>
            </div>
          )}
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-400 uppercase">Status</span>
          <div className="px-3 py-1 bg-accent/20 text-accent font-semibold text-sm rounded-full mt-1">
            {capture.status !== 'IDLE' ? capture.status : status}
          </div>
        </div>
      </div>

      {/* Live Scores */}
      <LiveScore matchId={matchId} />

      {/* Capture Control Area */}
      {isParticipant && (
        <div className="p-6 bg-surface-elevated border border-surface-border rounded-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">OCR Verification Stream</h3>
              <p className="text-sm text-gray-400">
                Share your game screen to activate automatic client-side score verification.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCalibration(!showCalibration)}
                className="px-3 py-2 bg-surface hover:bg-surface-border text-sm font-medium rounded-md border border-surface-border transition"
              >
                {showCalibration ? 'Hide Calibration' : 'Calibrate Target Box'}
              </button>

              {capture.status === 'CAPTURING' ? (
                <button
                  onClick={capture.stopCapture}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 font-bold rounded-md transition"
                >
                  Stop & Settle
                </button>
              ) : (
                <button
                  onClick={capture.startCapture}
                  className="px-5 py-2 bg-accent hover:bg-accent-600 font-bold rounded-md transition"
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
            <div className="flex items-center justify-between p-3 bg-surface rounded border border-surface-border text-xs font-mono">
              <span className="text-gray-400">Last Client OCR Read: <b className="text-white">{capture.lastScore}</b></span>
              <span className="text-gray-400">Confidence: <b className="text-accent">{(capture.confidence * 100).toFixed(1)}%</b></span>
            </div>
          )}

          {capture.error && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 rounded text-sm">
              {capture.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
