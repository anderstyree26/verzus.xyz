'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { formatEUR, formatPoints } from '../lib/currency';

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

export function WalletCard() {
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  const { data: balanceData, isLoading: loadingBalance, refetch: refetchBalance } = useQuery<WalletData>({
    queryKey: ['wallet-balance'],
    queryFn: () => apiClient<WalletData>('/wallet/balance'),
  });

  const { data: historyData, refetch: refetchHistory } = useQuery<TransactionItem[]>({
    queryKey: ['wallet-history'],
    queryFn: () => apiClient<TransactionItem[]>('/wallet/history?limit=5'),
  });

  const handleClaimFaucet = async () => {
    setFaucetLoading(true);
    try {
      await apiClient('/wallet/faucet', { method: 'POST' });
      alert('Claimed +1,000 Free Demo Points!');
      refetchBalance();
      refetchHistory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Faucet error: ${msg}`);
    } finally {
      setFaucetLoading(false);
    }
  };

  const cashBalance = balanceData?.cashEur ?? 0.0;
  const lockedCash = balanceData?.lockedCashEur ?? 0.0;
  const pointsBalance = balanceData?.balance ?? 10000;
  const lockedPoints = balanceData?.locked ?? 0;

  return (
    <>
      <div className="flex flex-col gap-5 p-6 bg-[#12121A] border border-[#222232] rounded-xl text-white shadow-xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222232] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Competitive Ledger Wallet</h2>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 font-bold text-[10px] rounded uppercase font-mono">
                Unified € EUR
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Standardized in Euros (€) worldwide for zero exchange-rate slippage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDepositModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#FF5500] hover:bg-[#FF4400] text-xs font-bold rounded-lg text-white transition shadow-sm"
            >
              + Deposit € (Paysafe)
            </button>
            <button
              type="button"
              onClick={handleClaimFaucet}
              disabled={faucetLoading}
              className="px-3 py-1.5 bg-surface hover:bg-surface-elevated border border-surface-border text-xs font-semibold rounded-lg text-gray-300 hover:text-white transition disabled:opacity-50"
            >
              {faucetLoading ? 'Claiming...' : '🚰 +1,000 PTS'}
            </button>
          </div>
        </div>

        {/* Dual Balance Cards: EUR Cash & Non-Fiat Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cash Balance (€ EUR) */}
          <div className="p-4 bg-[#161622] rounded-xl border border-[#262638] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  Cash Balance (€ EUR)
                </span>
                <span className="text-[10px] text-green-400 font-mono font-bold bg-green-950/60 px-1.5 py-0.5 rounded border border-green-800">
                  REAL VALUE
                </span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-green-400 mt-2">
                {loadingBalance ? '...' : formatEUR(cashBalance)}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#262638] flex items-center justify-between text-xs text-gray-400 font-mono">
              <span>Locked in Match Escrow:</span>
              <span className="text-white font-bold">{formatEUR(lockedCash)}</span>
            </div>
          </div>

          {/* Points Balance (PTS) */}
          <div className="p-4 bg-[#161622] rounded-xl border border-[#262638] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  Community Points (PTS)
                </span>
                <span className="text-[10px] text-[#FF5500] font-mono font-bold bg-[#FF5500]/15 px-1.5 py-0.5 rounded border border-[#FF5500]/30">
                  FREE PLAY
                </span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-[#FF5500] mt-2">
                {loadingBalance ? '...' : formatPoints(pointsBalance)}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#262638] flex items-center justify-between text-xs text-gray-400 font-mono">
              <span>Locked in Tournaments:</span>
              <span className="text-white font-bold">{formatPoints(lockedPoints)}</span>
            </div>
          </div>
        </div>

        {/* Recent Ledger Transactions */}
        {historyData && historyData.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            <span className="text-xs uppercase text-gray-400 font-bold tracking-wider">
              Recent Transactions
            </span>
            <div className="divide-y divide-[#222232] bg-surface rounded-lg p-2 border border-surface-border">
              {historyData.map((tx) => (
                <div key={tx.id} className="py-2.5 px-2 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold capitalize text-white">{tx.reason.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <div
                    className={`font-mono font-bold ${
                      tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} PTS
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Deposit via Paysafe Modal Preview */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#12121A] border border-[#222232] rounded-2xl p-6 text-white flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div>
                <h3 className="text-lg font-bold">Deposit Funds (€ EUR)</h3>
                <p className="text-xs text-gray-400">Powered by Paysafe Global Gaming Gateway</p>
              </div>
              <button
                type="button"
                onClick={() => setDepositModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-[#161622] rounded-xl border border-[#262638] flex flex-col gap-3">
              <span className="text-xs text-gray-300 font-semibold">Select Deposit Amount:</span>
              <div className="grid grid-cols-3 gap-2 font-mono text-sm font-bold">
                {['€5.00', '€15.00', '€25.00', '€50.00', '€100.00', '€250.00'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className="p-2.5 bg-surface hover:bg-[#FF5500]/20 border border-surface-border hover:border-[#FF5500] rounded-lg transition text-center"
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs text-gray-400">
              <p className="flex items-center gap-1.5 text-gray-300 font-medium">
                <span>🔒</span> Accepted Payment Methods:
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2 py-1 bg-surface border border-surface-border rounded">Paysafecard Voucher</span>
                <span className="px-2 py-1 bg-surface border border-surface-border rounded">Skrill Wallet</span>
                <span className="px-2 py-1 bg-surface border border-surface-border rounded">Neteller</span>
                <span className="px-2 py-1 bg-surface border border-surface-border rounded">Visa / Mastercard</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">
                All deposits are converted directly to Euros (€) at standard banking rates with zero exchange slippage. Age restriction: 18+ required for cash tournaments.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                alert('Paysafe Gateway integration: Sandbox mode active. To configure live API keys, see Phase 4.');
                setDepositModalOpen(false);
              }}
              className="w-full py-3 bg-[#FF5500] hover:bg-[#FF4400] font-bold text-xs rounded-lg text-white transition uppercase tracking-wider shadow"
            >
              Continue to Paysafe Checkout →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
