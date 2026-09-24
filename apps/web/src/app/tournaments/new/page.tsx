'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import type { GameProfile, TournamentFormat } from '@antigravity/core';

interface FormatDetail {
  label: string;
  badge: string;
  tagColor: string;
  description: string;
  bestFor: string;
  matchCount: string;
}

const TOURNAMENT_FORMATS: Record<TournamentFormat, FormatDetail> = {
  SINGLE_ELIM: {
    label: 'Single Elimination',
    badge: 'Knockout / Sudden Death',
    tagColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    description:
      'Classic high-stakes bracket. Win and advance; lose a single match and you are eliminated. Highest adrenaline and fastest progression to the championship.',
    bestFor: 'Large fields (8 to 64 players), fast-paced cups, decisive spectator esports.',
    matchCount: 'N - 1 matches (e.g. 8 players = 7 total matches, 3 rounds)',
  },
  DOUBLE_ELIM: {
    label: 'Double Elimination',
    badge: 'Second Chance / EVO Style',
    tagColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    description:
      'Two-tier bracket with Winners and Losers paths. Players must lose twice before elimination. The Losers bracket champion faces the undefeated Winners champion in the Grand Finals.',
    bestFor: 'Fighting games, Rocket League, competitive fairness where one fluke loss does not end your run.',
    matchCount: 'Approx 2N - 1 matches (Grand Finals includes potential bracket reset)',
  },
  ROUND_ROBIN: {
    label: 'Round Robin',
    badge: 'League / All-Play-All',
    tagColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    description:
      'Every participant plays a direct match against every other entrant. Placements are determined by total wins, head-to-head records, and cumulative score differential.',
    bestFor: 'Small groups (4 to 8 players), friend leagues, community nights with guaranteed play time for all.',
    matchCount: 'N × (N - 1) / 2 matches (e.g. 4 players = 6 matches, 8 players = 28 matches)',
  },
  SWISS: {
    label: 'Swiss System',
    badge: 'Skill-Paired / No Knockout',
    tagColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    description:
      'Non-elimination format over set rounds. Each round, players are paired against opponents with identical match records (e.g., 2-0 vs 2-0). No one gets knocked out early.',
    bestFor: 'Chess, Card Games (TCGs), Major qualifiers, competitive rankings where everyone plays every round.',
    matchCount: 'Typically 3 to 5 rounds; everyone participates in all rounds',
  },
};

export default function NewTournamentPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [profileId, setProfileId] = useState('');
  const [format, setFormat] = useState<TournamentFormat>('SINGLE_ELIM');
  const [size, setSize] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: profiles } = useQuery<GameProfile[]>({
    queryKey: ['approved-profiles'],
    queryFn: () => apiClient<GameProfile[]>('/games'),
  });

  const handleProfileChange = (selectedId: string) => {
    setProfileId(selectedId);
    const selected = profiles?.find((p) => p.id === selectedId);
    if (selected) {
      const displayName = selected.displayName || (selected as any).display_name || 'Game';
      const formatLabel = TOURNAMENT_FORMATS[format].label;
      // Auto-fill tournament name if empty or user hasn't typed custom name
      if (!name || name.includes('Tournament') || name.includes('Cup') || name.includes('Championship')) {
        setName(`${displayName} ${formatLabel} Championship`);
      }
    }
  };

  const handleFormatChange = (selectedFormat: TournamentFormat) => {
    setFormat(selectedFormat);
    const selected = profiles?.find((p) => p.id === profileId);
    if (selected && name.includes('Championship')) {
      const displayName = selected.displayName || (selected as any).display_name || 'Game';
      setName(`${displayName} ${TOURNAMENT_FORMATS[selectedFormat].label} Championship`);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) {
      setError('Please select a game profile');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const t = await apiClient<{ id: string }>('/tournaments', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          profileId,
          format,
          size: Number(size),
        }),
      });

      router.push(`/tournaments/${t.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setLoading(false);
    }
  };

  const currentFormatInfo = TOURNAMENT_FORMATS[format];

  return (
    <div className="max-w-2xl mx-auto my-8 p-8 bg-surface-elevated border border-surface-border rounded-xl text-white">
      <div className="border-b border-surface-border pb-4 mb-6">
        <h1 className="text-2xl font-bold">Create Tournament</h1>
        <p className="text-xs text-gray-400 mt-1">
          Configure tournament structure, bracket elimination engine, player caps, and rules.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-950/60 border border-red-800 rounded text-xs text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="flex flex-col gap-6">
        {/* Game Profile Selection */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-gray-300">Game Profile</label>
            <span className="text-[11px] text-gray-400">Determines OCR engine & calibration</span>
          </div>
          <select
            value={profileId}
            onChange={(e) => handleProfileChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
          >
            <option value="">Select a game profile...</option>
            {profiles?.map((p) => {
              const dName = p.displayName || (p as any).display_name || 'Game';
              const gType = p.gameType || (p as any).game_type || 'CUSTOM';
              return (
                <option key={p.id} value={p.id}>
                  {dName} ({p.platform || 'UNIVERSAL'} — {gType})
                </option>
              );
            })}
          </select>
        </div>

        {/* Tournament Name */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-gray-300">Tournament Name</label>
            <span className="text-[11px] text-gray-400">Auto-fills on game selection</span>
          </div>
          <input
            type="text"
            required
            placeholder="e.g. Genesis Weekly Cup #1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
          />
        </div>

        {/* Tournament Format Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">
            Tournament Format & Progression Engine
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {(Object.keys(TOURNAMENT_FORMATS) as TournamentFormat[]).map((fKey) => {
              const item = TOURNAMENT_FORMATS[fKey];
              const isSelected = format === fKey;
              return (
                <button
                  key={fKey}
                  type="button"
                  onClick={() => handleFormatChange(fKey)}
                  className={`p-3 rounded-lg border text-left transition flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-accent/15 border-accent text-white shadow-sm shadow-accent/20'
                      : 'bg-surface border-surface-border text-gray-300 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-bold">{item.label}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${item.tagColor}`}
                    >
                      {fKey === 'SINGLE_ELIM'
                        ? '1-Loss Out'
                        : fKey === 'DOUBLE_ELIM'
                        ? '2-Loss Out'
                        : fKey === 'ROUND_ROBIN'
                        ? 'All Play'
                        : 'Record-Paired'}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 line-clamp-2">{item.badge}</span>
                </button>
              );
            })}
          </div>

          {/* Detailed Format Explanation / Hint Card */}
          <div className="mt-3 p-4 bg-surface/70 border border-surface-border rounded-lg text-xs flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-accent">{currentFormatInfo.label}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${currentFormatInfo.tagColor}`}
              >
                {currentFormatInfo.badge}
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed">{currentFormatInfo.description}</p>
            <div className="pt-2 border-t border-surface-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-gray-400 block font-semibold">Recommended for:</span>
                <span className="text-gray-200">{currentFormatInfo.bestFor}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Match Structure:</span>
                <span className="text-accent-400 font-mono text-gray-200">{currentFormatInfo.matchCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Entrants Cap */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Entrants Cap (Bracket Size)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[4, 8, 16, 32, 64].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`py-2 text-xs font-bold rounded-md border transition ${
                  size === s
                    ? 'bg-accent border-accent text-white'
                    : 'bg-surface border-surface-border text-gray-400 hover:text-white'
                }`}
              >
                {s} Players
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5">
            {format === 'ROUND_ROBIN' && size > 8
              ? '⚠️ Notice: Round Robin with >8 players generates over 36 matches. Consider Swiss or Single Elimination for larger pools.'
              : `Generates a ${size}-entrant bracket tree with seed seeding.`}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-3 bg-accent hover:bg-accent-600 font-bold text-sm rounded-md transition disabled:opacity-50 shadow-md shadow-accent/25"
        >
          {loading ? 'Publishing Tournament...' : 'Publish Tournament Bracket'}
        </button>
      </form>
    </div>
  );
}
