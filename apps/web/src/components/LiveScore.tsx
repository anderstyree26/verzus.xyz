'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '../lib/api';

interface LiveScoreProps {
  matchId: string;
  initialScoreA?: string | number | null;
  initialScoreB?: string | number | null;
}

export function LiveScore({ matchId, initialScoreA = null, initialScoreB = null }: LiveScoreProps) {
  const [scoreA, setScoreA] = useState<string | number | null>(initialScoreA);
  const [scoreB, setScoreB] = useState<string | number | null>(initialScoreB);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';
    let socket: Socket | null = null;

    try {
      socket = io(`${wsUrl}/ws`, { transports: ['websocket'] });
      socket.on('connect', () => {
        setIsLive(true);
        socket?.emit('subscribe', { room: `match:${matchId}` });
      });

      socket.on('score_update', (data: { playerId: string; score: string | number; playerType: 'A' | 'B' }) => {
        if (data.playerType === 'A') setScoreA(data.score);
        if (data.playerType === 'B') setScoreB(data.score);
      });

      socket.on('disconnect', () => setIsLive(false));
    } catch {
      setIsLive(false);
    }

    // Polling fallback every 3 seconds
    const interval = setInterval(async () => {
      try {
        const match = await apiClient<{ score_a: { primary?: string | number }; score_b: { primary?: string | number } }>(
          `/matches/${matchId}`,
        );
        if (match.score_a?.primary !== undefined) setScoreA(match.score_a.primary);
        if (match.score_b?.primary !== undefined) setScoreB(match.score_b.primary);
      } catch {
        // quiet fallback
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.emit('unsubscribe', { room: `match:${matchId}` });
        socket.disconnect();
      }
    };
  }, [matchId]);

  return (
    <div className="flex items-center justify-between p-6 bg-surface-elevated border border-surface-border rounded-lg text-white">
      <div className="flex-1 text-center">
        <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Player A</span>
        <div className="text-4xl font-extrabold font-mono text-accent mt-1">
          {scoreA ?? '—'}
        </div>
      </div>

      <div className="flex flex-col items-center px-4">
        <span className="text-lg font-bold text-gray-500">VS</span>
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          <span className="text-[11px] text-gray-400 uppercase font-mono">{isLive ? 'Realtime' : 'Polling'}</span>
        </div>
      </div>

      <div className="flex-1 text-center">
        <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Player B</span>
        <div className="text-4xl font-extrabold font-mono text-white mt-1">
          {scoreB ?? '—'}
        </div>
      </div>
    </div>
  );
}
