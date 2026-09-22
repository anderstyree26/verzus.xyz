'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FriendList } from '../../components/FriendList';
import { apiClient } from '../../lib/api';

interface FriendItem {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: string;
}

export default function FriendsPage() {
  const [addresseeId, setAddresseeId] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: me } = useQuery<{ id: string }>({
    queryKey: ['me'],
    queryFn: () => apiClient<{ id: string }>('/profile/me'),
  });

  const { data: friends, refetch } = useQuery<FriendItem[]>({
    queryKey: ['friends'],
    queryFn: () => apiClient<FriendItem[]>('/social/friends'),
  });

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addresseeId.trim()) return;
    setLoading(true);

    try {
      await apiClient('/social/friends/request', {
        method: 'POST',
        body: JSON.stringify({ addresseeId: addresseeId.trim() }),
      });
      alert('Friend request sent!');
      setAddresseeId('');
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Friends & Connections</h1>
        <p className="text-sm text-gray-400">Connect with fellow competitors to launch private lobbies.</p>
      </div>

      <form onSubmit={handleAddFriend} className="p-4 bg-surface-elevated border border-surface-border rounded-lg flex gap-3">
        <input
          type="text"
          placeholder="Enter player user UUID..."
          value={addresseeId}
          onChange={(e) => setAddresseeId(e.target.value)}
          className="flex-1 px-3 py-2 bg-surface border border-surface-border rounded-md text-sm text-white focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-accent hover:bg-accent-600 font-bold text-xs rounded-md transition disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Add Friend'}
        </button>
      </form>

      <FriendList friends={friends ?? []} currentUserId={me?.id ?? ''} />
    </div>
  );
}
