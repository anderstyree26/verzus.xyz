'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';

interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  role: 'PLAYER' | 'REVIEWER' | 'ADMIN' | 'SUPER_ADMIN';
  is_banned: boolean;
  ban_reason: string | null;
  reputation_score: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [banModalUser, setBanModalUser] = useState<UserProfile | null>(null);
  const [banReason, setBanReason] = useState('');

  const { data: users, isLoading } = useQuery<UserProfile[]>({
    queryKey: ['admin-users'],
    queryFn: () => apiClient<UserProfile[]>('/admin/users'),
  });

  const banMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      apiClient(`/admin/users/${userId}/ban`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setBanModalUser(null);
      setBanReason('');
    },
  });

  const unbanMutation = useMutation({
    mutationFn: (userId: string) =>
      apiClient(`/admin/users/${userId}/unban`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiClient(`/admin/users/${userId}/role`, {
        method: 'POST',
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link href="/admin" className="hover:text-white transition">Admin</Link>
            <span>/</span>
            <span className="text-gray-200">Users</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-xs text-gray-400">Manage user roles, reviewer eligibility, and anti-cheat bans.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-500 py-8 text-center">Loading platform users...</div>
      ) : !users || users.length === 0 ? (
        <div className="text-sm text-gray-500 py-8 text-center bg-surface-elevated border border-surface-border rounded-lg">
          No registered users found.
        </div>
      ) : (
        <div className="bg-surface-elevated border border-surface-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-border/50 text-gray-400 border-b border-surface-border uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Player</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Reputation</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition">
                    <td className="p-3 font-medium text-white">
                      <div>@{u.username}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{u.id.substring(0, 8)}...</div>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          roleMutation.mutate({
                            userId: u.id,
                            role: e.target.value,
                          })
                        }
                        className="bg-surface-border text-white text-xs px-2 py-1 rounded border border-surface-border focus:border-accent outline-none"
                      >
                        <option value="PLAYER">PLAYER</option>
                        <option value="REVIEWER">REVIEWER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-accent font-semibold">{u.reputation_score}</span>
                    </td>
                    <td className="p-3">
                      {u.is_banned ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950/60 text-red-400 border border-red-800/60">
                          BANNED: {u.ban_reason || 'Violation'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {u.is_banned ? (
                        <button
                          onClick={() => unbanMutation.mutate(u.id)}
                          className="px-2 py-1 rounded text-xs bg-surface-border text-gray-200 hover:text-white hover:bg-surface-border/80 transition"
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setBanModalUser(u);
                            setBanReason('');
                          }}
                          className="px-2 py-1 rounded text-xs bg-red-900/40 text-red-300 border border-red-800/60 hover:bg-red-900/60 transition"
                        >
                          Ban User
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {banModalUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-elevated border border-surface-border rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Ban @{banModalUser.username}</h3>
            <p className="text-xs text-gray-400">
              Provide a valid reason for banning this user. They will be locked out of matchmaking, challenges, and wallet operations.
            </p>
            <input
              type="text"
              placeholder="e.g. Cheat detection: suspicious score jump / emulator exploit"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="w-full bg-surface-border text-white text-xs px-3 py-2 rounded border border-surface-border focus:border-accent outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setBanModalUser(null)}
                className="px-3 py-1.5 rounded text-xs text-gray-300 hover:text-white bg-surface-border"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  banMutation.mutate({
                    userId: banModalUser.id,
                    reason: banReason || 'Terms of Service violation',
                  })
                }
                disabled={banMutation.isPending}
                className="px-3 py-1.5 rounded text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition disabled:opacity-50"
              >
                {banMutation.isPending ? 'Banning...' : 'Confirm Ban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
