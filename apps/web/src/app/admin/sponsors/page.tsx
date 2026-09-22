'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  funded_amount: number;
  created_at: string;
}

export default function AdminSponsorsPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [fundedAmount, setFundedAmount] = useState('0');

  const { data: sponsors, isLoading } = useQuery<Sponsor[]>({
    queryKey: ['admin-sponsors'],
    queryFn: () => apiClient<Sponsor[]>('/admin/sponsors'),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiClient('/admin/sponsors', {
        method: 'POST',
        body: JSON.stringify({
          name,
          websiteUrl: websiteUrl || undefined,
          fundedAmount: parseInt(fundedAmount, 10) || 0,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sponsors'] });
      setIsCreating(false);
      setName('');
      setWebsiteUrl('');
      setFundedAmount('0');
    },
  });

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link href="/admin" className="hover:text-white transition">Admin</Link>
            <span>/</span>
            <span className="text-gray-200">Sponsors</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Sponsor Funding</h1>
          <p className="text-xs text-gray-400">Manage partners funding platform tournaments and prize pools.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent hover:bg-accent/80 text-white transition"
        >
          + Add Sponsor
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="p-5 bg-surface-elevated border border-surface-border rounded-xl space-y-4"
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">New Sponsor Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Sponsor / Brand Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Red Bull Esports"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-border text-white text-xs px-3 py-2 rounded border border-surface-border focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Website URL</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full bg-surface-border text-white text-xs px-3 py-2 rounded border border-surface-border focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Initial Funded Amount (POINTS)</label>
              <input
                type="number"
                min="0"
                value={fundedAmount}
                onChange={(e) => setFundedAmount(e.target.value)}
                className="w-full bg-surface-border text-white text-xs px-3 py-2 rounded border border-surface-border focus:border-accent outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded text-xs text-gray-400 hover:text-white bg-surface-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !name}
              className="px-4 py-1.5 rounded text-xs font-semibold bg-accent hover:bg-accent/80 text-white transition disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving...' : 'Create Sponsor'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-sm text-gray-500 py-8 text-center">Loading sponsors...</div>
      ) : !sponsors || sponsors.length === 0 ? (
        <div className="text-sm text-gray-500 py-8 text-center bg-surface-elevated border border-surface-border rounded-lg">
          No sponsors registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sponsors.map((s) => (
            <div
              key={s.id}
              className="p-5 bg-surface-elevated border border-surface-border rounded-xl flex items-center justify-between"
            >
              <div>
                <h3 className="font-bold text-white text-base">{s.name}</h3>
                {s.website_url && (
                  <a
                    href={s.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-accent hover:underline block mt-0.5"
                  >
                    {s.website_url}
                  </a>
                )}
                <div className="text-[11px] text-gray-500 mt-2">
                  Created {new Date(s.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-gray-400 block">Total Funded</span>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  {s.funded_amount.toLocaleString()} PTS
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
