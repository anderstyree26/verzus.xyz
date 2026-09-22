'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';

interface MyProfile {
  id: string;
  username: string;
  display_name?: string;
  region?: string;
  phone?: string;
}

export default function SettingsPage() {
  const { data: profile } = useQuery<MyProfile>({
    queryKey: ['me-settings'],
    queryFn: () => apiClient<MyProfile>('/profile/me'),
  });

  const [displayName, setDisplayName] = useState('');
  const [region, setRegion] = useState('KE');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setRegion(profile.region || 'KE');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient('/profile/me', {
        method: 'PATCH',
        body: JSON.stringify({ displayName, region, phone }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Save failed: ${msg}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 p-8 bg-surface-elevated border border-surface-border rounded-xl text-white">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      <p className="text-xs text-gray-400 mt-1">Update display preferences and regional payout details.</p>

      {saved && (
        <div className="mt-4 p-3 bg-green-950/60 border border-green-800 rounded text-xs text-green-300">
          Settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Region (ISO Alpha-2)</label>
          <input
            type="text"
            maxLength={2}
            placeholder="KE, US, NG, GB"
            value={region}
            onChange={(e) => setRegion(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white uppercase focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number (For M-Pesa / SMS)</label>
          <input
            type="tel"
            placeholder="+254712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
          />
        </div>

        <button
          type="submit"
          className="mt-2 w-full py-2.5 bg-accent hover:bg-accent-600 font-bold text-sm rounded-md transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
