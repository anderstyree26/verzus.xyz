'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { CountrySelect } from '../../components/CountrySelect';

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
  const [region, setRegion] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setRegion(profile.region || '');
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
    <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 bg-[#12121A] border border-[#1E1E2C] rounded-2xl text-white shadow-2xl">
      <div className="flex items-center gap-3 pb-5 border-b border-[#1E1E2C]">
        <div className="w-10 h-10 rounded-xl bg-[#FF5500] flex items-center justify-center font-black text-black text-lg">
          ⚙️
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Account Settings</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage gamer profile, country eligibility, and Paysafe details.</p>
        </div>
      </div>

      {saved && (
        <div className="mt-4 p-3 bg-green-950/60 border border-green-800 rounded-xl text-xs text-green-300 font-bold">
          ✓ Profile settings updated successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="mt-6 flex flex-col gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#0C0C12] border border-[#262638] rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5500]"
          />
        </div>

        <div>
          <CountrySelect
            value={region}
            onChange={(c) => setRegion(c.code)}
            label="Country / Nationality (for National & Regional Cups)"
            placeholder="Select your nationality..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
            Mobile Number (for Paysafe KYC & Brevo 2FA)
          </label>
          <input
            type="tel"
            placeholder="+1 555 123 4567 or +44 7911 123456"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#0C0C12] border border-[#262638] rounded-xl text-sm text-white focus:outline-none focus:border-[#FF5500]"
          />
        </div>

        <button
          type="submit"
          className="mt-3 w-full py-3 bg-[#FF5500] hover:bg-[#FF661A] text-black font-black text-sm uppercase tracking-wider rounded-xl transition shadow-lg shadow-[#FF5500]/20"
        >
          Save Profile Settings
        </button>
      </form>
    </div>
  );
}
