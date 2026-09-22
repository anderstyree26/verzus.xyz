'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalibrationTool } from '../../../components/CalibrationTool';
import { apiClient } from '../../../lib/api';
import type { GameType, Platform, ROI } from '@antigravity/core';

export default function NewGameProfilePage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [gameType, setGameType] = useState<GameType>('HIGH_SCORE');
  const [platform, setPlatform] = useState<Platform>('MOBILE');
  const [endKeywords, setEndKeywords] = useState('Game Over, Victory, Defeat');
  const [regexPattern, setRegexPattern] = useState('');
  const [roi, setRoi] = useState<ROI>({ x: 0.1, y: 0.1, w: 0.3, h: 0.2 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient('/games', {
        method: 'POST',
        body: JSON.stringify({
          displayName,
          gameType,
          platform,
          roi,
          endKeywords: endKeywords.split(',').map((k) => k.trim()).filter(Boolean),
          regexPattern: regexPattern ? regexPattern : null,
        }),
      });

      alert('Game profile submitted! Awaiting administrator approval.');
      router.push('/games');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-8 bg-surface-elevated border border-surface-border rounded-xl text-white">
      <h1 className="text-2xl font-bold">Submit OCR Game Profile</h1>
      <p className="text-xs text-gray-400 mt-1">Calibrate coordinates and configure OCR verification rules.</p>

      {error && (
        <div className="mt-4 p-3 bg-red-950/60 border border-red-800 rounded text-xs text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Game Display Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Subway Surfers (iOS)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Engine Game Type</label>
            <select
              value={gameType}
              onChange={(e) => setGameType(e.target.value as GameType)}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
            >
              <option value="HIGH_SCORE">HIGH_SCORE (Highest score wins)</option>
              <option value="LOW_TIME">LOW_TIME (Fastest duration wins)</option>
              <option value="SURVIVAL">SURVIVAL (Longest duration wins)</option>
              <option value="HEAD_TO_HEAD">HEAD_TO_HEAD (Both on screen)</option>
              <option value="BINARY_RESULT">BINARY_RESULT (Win / Loss detected)</option>
              <option value="COMPOSITE_STAT">COMPOSITE_STAT (Weighted formula)</option>
              <option value="PROGRESSION">PROGRESSION (Ranks + value)</option>
              <option value="PHYSICAL">PHYSICAL (Stable whiteboard reads)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
            >
              <option value="MOBILE">MOBILE</option>
              <option value="PC">PC</option>
              <option value="CONSOLE">CONSOLE</option>
              <option value="WEB">WEB</option>
              <option value="PHYSICAL">PHYSICAL</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            End Match Detection Keywords (Comma-separated)
          </label>
          <input
            type="text"
            placeholder="Game Over, Victory, Defeat, Final Score"
            value={endKeywords}
            onChange={(e) => setEndKeywords(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Custom Regex Extraction Pattern (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Score:\s*([0-9,]+)"
            value={regexPattern}
            onChange={(e) => setRegexPattern(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white font-mono focus:outline-none focus:border-accent"
          />
        </div>

        {/* Calibration ROI Drag Tool */}
        <div className="flex flex-col gap-2">
          <label className="block text-xs font-semibold text-gray-300">Bounding Box Calibration (ROI)</label>
          <CalibrationTool initialRoi={roi} onSave={(newRoi) => setRoi(newRoi)} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-2.5 bg-accent hover:bg-accent-600 font-bold text-sm rounded-md transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Game Profile for Review'}
        </button>
      </form>
    </div>
  );
}
