'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

interface WalletData {
  balance: number;
  locked: number;
  currency: string;
}

interface TransactionItem {
  id: string;
  amount: number;
  balanceAfter: number;
  reason: string;
  createdAt: string;
}

export function WalletCard() {
  const { data: balanceData, isLoading: loadingBalance } = useQuery<WalletData>({
    queryKey: ['wallet-balance'],
    queryFn: () => apiClient<WalletData>('/wallet/balance'),
  });

  const { data: historyData } = useQuery<TransactionItem[]>({
    queryKey: ['wallet-history'],
    queryFn: () => apiClient<TransactionItem[]>('/wallet/history?limit=5'),
  });

  return (
    <div className="flex flex-col gap-5 p-6 bg-surface-elevated border border-surface-border rounded-lg text-white">
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div>
          <span className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Demo Wallet</span>
          <h2 className="text-xl font-bold">Ledger Balance</h2>
        </div>
        <span className="px-2.5 py-1 bg-accent/20 text-accent font-bold text-xs rounded-full">
          {balanceData?.currency ?? 'POINTS'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-surface rounded-md border border-surface-border">
          <span className="text-xs text-gray-400 uppercase font-medium">Available</span>
          <div className="text-2xl font-extrabold font-mono text-accent mt-1">
            {loadingBalance ? '...' : (balanceData?.balance ?? 0).toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-surface rounded-md border border-surface-border">
          <span className="text-xs text-gray-400 uppercase font-medium">Locked in Escrow</span>
          <div className="text-2xl font-extrabold font-mono text-gray-300 mt-1">
            {loadingBalance ? '...' : (balanceData?.locked ?? 0).toLocaleString()}
          </div>
        </div>
      </div>

      {historyData && historyData.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          <span className="text-xs uppercase text-gray-400 font-semibold">Recent Ledger Activity</span>
          <div className="divide-y divide-surface-border">
            {historyData.map((tx) => (
              <div key={tx.id} className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold capitalize text-white">{tx.reason.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] text-gray-500">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                </div>
                <div
                  className={`font-mono font-bold ${
                    tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
