'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../../lib/supabase';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
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
    <div className="max-w-md mx-auto my-12 p-8 bg-surface-elevated border border-surface-border rounded-xl">
      <h2 className="text-2xl font-bold text-center">Join Antigravity</h2>
      <p className="text-xs text-gray-400 text-center mt-1">10,000 Free Demo POINTS credited upon signup</p>

      {error && (
        <div className="mt-4 p-3 bg-red-950/60 border border-red-800 rounded text-xs text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSignUp} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Username</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-2.5 bg-accent hover:bg-accent-600 font-bold text-sm rounded-md transition disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:underline font-semibold">
          Sign In
        </Link>
      </p>
    </div>
  );
}
