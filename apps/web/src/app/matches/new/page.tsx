'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { useGameStore } from '../../../lib/gameStore';
import { usePartyStore } from '../../../lib/partyStore';
import { formatEUR, formatPoints } from '../../../lib/currency';
import { CountrySelect } from '../../../components/CountrySelect';
import { OFFICIAL_GAMES, getGameById } from '../../../lib/gamesCatalog';
import { useWalletModeStore } from '../../../lib/walletModeStore';
import { useGameAccountsStore } from '../../../lib/gameAccountsStore';
import type { GameProfile, MatchFormat } from '@antigravity/core';

const STAKE_PRESETS_REAL = [0, 1, 2.5, 5, 10, 20];
const STAKE_PRESETS_DEMO = [0, 100, 250, 500, 1000, 2500];

function NewMatchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultProfileId = searchParams.get('profileId') || '';

  const { activeGame, setActiveGameById } = useGameStore();
  const { members } = usePartyStore();
  const { mode: walletMode } = useWalletModeStore();
  const { getGamertag, getGamertagLabel, setGamertag } = useGameAccountsStore();

  const [profileId, setProfileId] = useState(defaultProfileId || activeGame?.id || 'cs2');
  const [format, setFormat] = useState<MatchFormat>('BO1');
  const [mode, setMode] = useState<'1v1' | 'PARTY'>(members.length > 1 ? 'PARTY' : '1v1');
  const [entryFee, setEntryFee] = useState<number>(0);
  const [customFee, setCustomFee] = useState<string>('');
  const [isCountryRestricted, setIsCountryRestricted] = useState(false);
  const [targetCountry, setTargetCountry] = useState<string>('');
  const [opponentId, setOpponentId] = useState('');
  const [gamertagInput, setGamertagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: profiles } = useQuery<GameProfile[]>({
    queryKey: ['approved-profiles'],
    queryFn: () => apiClient<GameProfile[]>('/games').catch(() => []),
  });

  const officialIds = new Set(OFFICIAL_GAMES.map((g) => g.id.toLowerCase()));
  const customGames = (profiles || []).filter(
    (g) => !officialIds.has(g.id.toLowerCase())
  );
  const allAvailableGames = [...OFFICIAL_GAMES, ...customGames];

  // Sync with activeGame or default
  useEffect(() => {
    if (!profileId && activeGame?.id) {
      setProfileId(activeGame.id);
    }
  }, [profileId, activeGame]);

  const handleGameSelect = (id: string) => {
    setProfileId(id);
    setActiveGameById(id, allAvailableGames);
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
    <div className="max-w-2xl mx-auto my-6 p-6 sm:p-8 bg-[#111319] border border-[#202430] rounded-2xl text-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-[#202430]">
        <div className="w-12 h-12 rounded-xl bg-[#C86228] flex items-center justify-center font-black text-white text-lg shadow-sm">
          VX
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Create Arena Duel</h1>
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
            1. Select Esports Title <span className="text-[#C86228]">*</span>
          </label>
          <select
            value={profileId}
            onChange={(e) => handleGameSelect(e.target.value)}
            className="w-full px-4 py-3 bg-[#161922] border border-[#202430] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-[#C86228] transition"
          >
            <option value="">Select a competitive game...</option>
            {allAvailableGames.map((p) => {
              const dName = p.displayName || (p as any).display_name || 'Game';
              const catalogItem = OFFICIAL_GAMES.find((c) => c.id.toLowerCase() === p.id.toLowerCase());
              const icon = catalogItem?.icon || '🎮';
              return (
                <option key={p.id} value={p.id}>
                  {icon} {dName} ({p.platform || 'UNIVERSAL'})
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
                  ? 'bg-[#C86228]/15 border-[#C86228] text-white'
                  : 'bg-[#161922] border-[#202430] text-gray-400 hover:text-white'
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
                  ? 'bg-[#C86228]/15 border-[#C86228] text-white'
                  : 'bg-[#161922] border-[#202430] text-gray-400 hover:text-white'
              }`}
            >
              <div className="text-sm font-bold flex items-center gap-1.5">
                Party vs Party
                {members.length > 1 && (
                  <span className="px-1.5 py-0.2 bg-[#C86228] text-white text-[10px] font-bold rounded">
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
                className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition ${
                  format === f
                    ? 'bg-[#C86228] border-[#C86228] text-white shadow-sm'
                    : 'bg-[#161922] border-[#202430] text-gray-400 hover:text-white'
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

        {/* Active Ledger Entry Stakes & Prize Pool */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                4. Entry Stake
              </label>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                walletMode === 'REAL'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-purple-500/15 border-purple-500/40 text-purple-300'
              }`}>
                {walletMode === 'REAL' ? '🟢 REAL CASH (€ EUR)' : '🟣 DEMO PLAY (PTS)'}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              Guaranteed Prize:{' '}
              <strong className="text-[#D97736] font-mono">
                {prizePool > 0
                  ? walletMode === 'REAL'
                    ? formatEUR(prizePool)
                    : `${formatPoints(prizePool)} PTS`
                  : 'Free Glory'}
              </strong>
            </span>
          </div>

          {walletMode === 'DEMO' && (
            <div className="mb-2 p-2 bg-purple-950/40 border border-purple-800/60 rounded-lg text-[11px] text-purple-300 flex items-center gap-2">
              <span>🎮</span>
              <span><strong>Demo Practice Match:</strong> Staking points with zero financial risk. Switch to Real Cash in the top bar to play for real Euros.</span>
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(walletMode === 'REAL' ? STAKE_PRESETS_REAL : STAKE_PRESETS_DEMO).map((fee) => (
              <button
                key={fee}
                type="button"
                onClick={() => {
                  setEntryFee(fee);
                  setCustomFee('');
                }}
                className={`py-2 text-xs font-bold rounded-lg border transition ${
                  entryFee === fee && customFee === ''
                    ? 'bg-[#C86228] border-[#C86228] text-white shadow-sm'
                    : 'bg-[#161922] border-[#202430] text-gray-300 hover:border-gray-500'
                }`}
              >
                {fee === 0
                  ? 'FREE'
                  : walletMode === 'REAL'
                  ? formatEUR(fee)
                  : `${formatPoints(fee)} PTS`}
              </button>
            ))}
          </div>

          {/* Legal / Fair Play Disclaimer */}
          <div className="mt-3 p-3 bg-[#0B0C10] border border-[#202430] rounded-lg flex items-start gap-2.5 text-[11px] text-gray-400">
            <span className="text-[#D97736] text-base leading-none">⚖️</span>
            <span>
              <strong>Skill-Based Peer-to-Peer Competition:</strong> Entry stakes are held in escrow. The winner claims the pre-determined guaranteed prize pool. 10% platform fee is deducted for hosting & automated background verification.
            </span>
          </div>
        </div>

        {/* In-Game Gamertag Onboarding for Selected Game */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
              5. Your {getGamertagLabel(profileId)} (In-Game Handle)
            </label>
            {getGamertag(profileId) && (
              <span className="text-xs text-green-400 font-mono">
                Linked: <strong>{getGamertag(profileId)}</strong>
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder={`Enter your in-game ${getGamertagLabel(profileId)} so opponent can invite you...`}
            value={gamertagInput || getGamertag(profileId) || ''}
            onChange={(e) => {
              setGamertagInput(e.target.value);
              setGamertag(profileId, e.target.value);
            }}
            className="w-full px-4 py-2.5 bg-[#161922] border border-[#202430] rounded-xl text-sm font-mono text-white focus:outline-none focus:border-[#C86228]"
          />
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
              className="text-xs text-[#D97736] hover:underline font-semibold"
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
            <div className="p-3 bg-[#161922] border border-[#202430] rounded-xl text-xs text-gray-300 flex items-center gap-2">
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
            placeholder="Friend UUID or leave empty to list on Public Duel Board"
            value={opponentId}
            onChange={(e) => setOpponentId(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#161922] border border-[#202430] rounded-xl text-sm text-white focus:outline-none focus:border-[#C86228]"
          />
        </div>

        {/* Launch Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-3.5 bg-[#C86228] hover:bg-[#D97736] text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#C86228]/20 disabled:opacity-50"
        >
          {loading ? 'Initializing Arena Lobby...' : 'Launch Arena Duel'}
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
