'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { useGameStore } from '../../../lib/gameStore';
import { usePartyStore } from '../../../lib/partyStore';
import { formatEUR } from '../../../lib/currency';
import { CountrySelect } from '../../../components/CountrySelect';
import type { GameProfile, MatchFormat } from '@antigravity/core';

const STAKE_PRESETS = [0, 1, 2.5, 5, 10, 20];

function NewMatchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultProfileId = searchParams.get('profileId') || '';

  const { activeGame, setActiveGameById } = useGameStore();
  const { members } = usePartyStore();

  const [profileId, setProfileId] = useState(defaultProfileId);
  const [format, setFormat] = useState<MatchFormat>('BO1');
  const [mode, setMode] = useState<'1v1' | 'PARTY'>(members.length > 1 ? 'PARTY' : '1v1');
  const [entryFee, setEntryFee] = useState<number>(0);
  const [customFee, setCustomFee] = useState<string>('');
  const [isCountryRestricted, setIsCountryRestricted] = useState(false);
  const [targetCountry, setTargetCountry] = useState<string>('');
  const [opponentId, setOpponentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: profiles } = useQuery<GameProfile[]>({
    queryKey: ['approved-profiles'],
    queryFn: () => apiClient<GameProfile[]>('/games'),
  });

  // Sync with activeGame or profiles
  useEffect(() => {
    if (!profileId && activeGame?.id) {
      setProfileId(activeGame.id);
    } else if (!profileId && profiles && profiles.length > 0 && profiles[0]) {
      setProfileId(profiles[0].id);
    }
  }, [profileId, activeGame, profiles]);

  const handleGameSelect = (id: string) => {
    setProfileId(id);
    if (profiles) {
      setActiveGameById(id, profiles);
    }
  };

  const effectiveFee = customFee !== '' ? Math.max(0, parseFloat(customFee) || 0) : entryFee;
  // Guaranteed prize pool with pre-disclosed 10% platform fee for peer-to-peer cash duels
  const prizePool = effectiveFee > 0 ? (effectiveFee * 2) * 0.90 : 0;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) {
      setError('Please select a game');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const match = await apiClient<{ id: string }>('/matches', {
        method: 'POST',
        body: JSON.stringify({
          profileId,
          opponentId: opponentId ? opponentId.trim() : null,
          format,
          entryFee: effectiveFee,
          mode,
          countryCode: isCountryRestricted ? targetCountry : null,
        }),
      });

      router.push(`/matches/${match.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-6 p-6 sm:p-8 bg-[#12121A] border border-[#1E1E2C] rounded-2xl text-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-[#1E1E2C]">
        <div className="w-12 h-12 rounded-xl bg-[#FF5500] flex items-center justify-center font-black text-black text-xl">
          VS
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Create VS Matchroom</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Host a competitive duel or challenge with client-side OCR score validation.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="mt-6 flex flex-col gap-6">
        {/* Game Archetype Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
            1. Select Esports Title <span className="text-[#FF5500]">*</span>
          </label>
          <select
            value={profileId}
            onChange={(e) => handleGameSelect(e.target.value)}
            className="w-full px-4 py-3 bg-[#0C0C12] border border-[#262638] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-[#FF5500] transition"
          >
            <option value="">Select a competitive game...</option>
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

        {/* Match Mode */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
            2. Match Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('1v1')}
              className={`p-3 rounded-xl border text-left transition ${
                mode === '1v1'
                  ? 'bg-[#FF5500]/15 border-[#FF5500] text-white'
                  : 'bg-[#0C0C12] border-[#262638] text-gray-400 hover:text-white'
              }`}
            >
              <div className="text-sm font-bold">1v1 Solo Duel</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Head-to-head individual combat</div>
            </button>

            <button
              type="button"
              onClick={() => setMode('PARTY')}
              className={`p-3 rounded-xl border text-left transition ${
                mode === 'PARTY'
                  ? 'bg-[#FF5500]/15 border-[#FF5500] text-white'
                  : 'bg-[#0C0C12] border-[#262638] text-gray-400 hover:text-white'
              }`}
            >
              <div className="text-sm font-bold flex items-center gap-1.5">
                Party vs Party
                {members.length > 1 && (
                  <span className="px-1.5 py-0.2 bg-[#FF5500] text-black text-[10px] font-black rounded">
                    {members.length} Squad
                  </span>
                )}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">Queue with your current party</div>
            </button>
          </div>
        </div>

        {/* Match Series Format */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
            3. Series Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['BO1', 'BO3', 'BO5'] as MatchFormat[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border transition ${
                  format === f
                    ? 'bg-[#FF5500] border-[#FF5500] text-black'
                    : 'bg-[#0C0C12] border-[#262638] text-gray-400 hover:text-white'
                }`}
              >
                Best of {f.replace('BO', '')}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {format === 'BO1' && '⚡ Sudden-death single game. Winner takes matchroom victory.'}
            {format === 'BO3' && '⚔️ Best of 3 games. First player to 2 game wins claims victory.'}
            {format === 'BO5' && '🏆 Championship format. First player to 3 game wins claims victory.'}
          </p>
        </div>

        {/* EUR Entry Stakes & Prize Pool */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
              4. Entry Stake (Euros €)
            </label>
            <span className="text-xs text-gray-400">
              Guaranteed Prize: <strong className="text-[#FF5500] font-mono">{prizePool > 0 ? formatEUR(prizePool) : 'Free Glory'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {STAKE_PRESETS.map((fee) => (
              <button
                key={fee}
                type="button"
                onClick={() => {
                  setEntryFee(fee);
                  setCustomFee('');
                }}
                className={`py-2 text-xs font-black rounded-lg border transition ${
                  entryFee === fee && customFee === ''
                    ? 'bg-[#FF5500] border-[#FF5500] text-black'
                    : 'bg-[#0C0C12] border-[#262638] text-gray-300 hover:border-gray-500'
                }`}
              >
                {fee === 0 ? 'FREE' : formatEUR(fee)}
              </button>
            ))}
          </div>

          {/* Legal / Fair Play Disclaimer */}
          <div className="mt-3 p-3 bg-[#0C0C12] border border-[#1E1E2C] rounded-lg flex items-start gap-2.5 text-[11px] text-gray-400">
            <span className="text-[#FF5500] text-base leading-none">⚖️</span>
            <span>
              <strong>Skill-Based Peer-to-Peer Competition:</strong> Entry stakes are held in escrow. The winner claims the pre-determined guaranteed prize pool. 10% platform fee is deducted for hosting & anti-cheat OCR verification.
            </span>
          </div>
        </div>

        {/* Geo / Regional Eligibility */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
              5. Regional / Country Restriction
            </label>
            <button
              type="button"
              onClick={() => setIsCountryRestricted(!isCountryRestricted)}
              className="text-xs text-[#FF5500] hover:underline font-semibold"
            >
              {isCountryRestricted ? 'Switch to Worldwide' : '+ Restrict to Specific Country'}
            </button>
          </div>

          {isCountryRestricted ? (
            <CountrySelect
              value={targetCountry}
              onChange={(c) => setTargetCountry(c.code)}
              label="Eligible Country"
              placeholder="Select country eligible for this duel..."
            />
          ) : (
            <div className="p-3 bg-[#0C0C12] border border-[#262638] rounded-xl text-xs text-gray-300 flex items-center gap-2">
              <span className="text-base">🌍</span>
              <span><strong>Worldwide Open:</strong> Players from all 249 recognized territories can join.</span>
            </div>
          )}
        </div>

        {/* Opponent Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
            6. Opponent (Optional)
          </label>
          <input
            type="text"
            placeholder="Friend UUID or leave empty to list on Public VS Board"
            value={opponentId}
            onChange={(e) => setOpponentId(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#0C0C12] border border-[#262638] rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5500]"
          />
        </div>

        {/* Launch Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-3.5 bg-[#FF5500] hover:bg-[#FF661A] text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-[#FF5500]/25 disabled:opacity-50"
        >
          {loading ? 'Initializing VS Lobby...' : 'Launch VS Matchroom'}
        </button>
      </form>
    </div>
  );
}

export default function NewMatchPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400 text-sm font-mono">Loading VS Match creator...</div>}>
      <NewMatchForm />
    </Suspense>
  );
}
