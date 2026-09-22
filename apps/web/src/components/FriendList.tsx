'use client';

interface Friend {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: string;
}

interface FriendListProps {
  friends: Friend[];
  currentUserId: string;
}

export function FriendList({ friends, currentUserId }: FriendListProps) {
  if (friends.length === 0) {
    return (
      <div className="p-6 text-center bg-surface-elevated border border-surface-border rounded-lg text-gray-400 text-sm">
        No friends yet. Send a request to play private challenges!
      </div>
    );
  }

  return (
    <div className="p-5 bg-surface-elevated border border-surface-border rounded-lg flex flex-col gap-3">
      <h3 className="text-sm uppercase font-bold text-gray-400 tracking-wider">Friends List</h3>
      <div className="divide-y divide-surface-border">
        {friends.map((f) => {
          const friendId = f.requesterId === currentUserId ? f.addresseeId : f.requesterId;
          return (
            <div key={f.id} className="py-2.5 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-surface border border-surface-border flex items-center justify-center font-bold text-xs text-accent">
                  {friendId.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-semibold text-white">Player #{friendId.slice(0, 6)}</span>
              </div>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded font-medium">
                Online
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
