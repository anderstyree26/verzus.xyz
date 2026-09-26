'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../../lib/supabase';
import { CountrySelect } from '../../components/CountrySelect';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!countryCode) {
      setError('Please select your country / nationality for tournament eligibility.');
      return;
    }

    if (!ageConfirmed) {
      setError('You must confirm your age and agree to the VerzusXYZ competitive rules.');
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim().toLowerCase(),
            display_name: username.trim(),
            country_code: countryCode,
          },
        },
      });

      if (authError) throw authError;
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-surface-elevated border border-surface-border rounded-xl shadow-2xl">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-[#FF5500] flex items-center justify-center font-black text-black text-base tracking-tighter">
          V
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">Join VerzusXYZ</h2>
      </div>
      <p className="text-xs text-gray-400 text-center">
        The Global Competitive Esports & Skill Arena
      </p>
      <div className="mt-3 py-1.5 px-3 bg-[#FF5500]/10 border border-[#FF5500]/30 rounded-lg text-center">
        <span className="text-xs text-[#FF5500] font-semibold">
          🎁 10,000 Free Demo POINTS credited upon registration
        </span>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-950/60 border border-red-800 rounded text-xs text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSignUp} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Gamer Tag / Username <span className="text-[#FF5500]">*</span>
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. s1mple, ace_sniper"
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-[#FF5500]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Email Address <span className="text-[#FF5500]">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-[#FF5500]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Password <span className="text-[#FF5500]">*</span>
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-[#FF5500]"
          />
        </div>

        {/* Global Country & Nationality Selection */}
        <CountrySelect
          value={countryCode}
          onChange={(c) => setCountryCode(c.code)}
          label="Country / Nationality (for Regional & National Ladders)"
          placeholder="Select your country..."
          required
        />

        {/* Age & Terms Compliance */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-300 select-none">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-surface-border bg-surface text-[#FF5500] focus:ring-[#FF5500] focus:ring-offset-0 h-4 w-4 accent-[#FF5500]"
            />
            <span>
              I confirm I am at least <strong className="text-white">13 years old</strong> (18+ for real-money EUR competitions) and agree to the{' '}
              <span className="text-[#FF5500] hover:underline">VerzusXYZ Skill Gaming Terms</span> & Fair Play Standards.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-3 bg-[#FF5500] hover:bg-[#FF661A] text-black font-extrabold text-sm uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-[#FF5500]/20 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account & Play'}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-[#FF5500] hover:underline font-semibold">
          Sign In
        </Link>
      </p>
    </div>
  );
}
