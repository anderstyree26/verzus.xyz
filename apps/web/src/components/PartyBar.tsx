'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { usePartyStore } from '../lib/partyStore';
import { useGameStore } from '../lib/gameStore';
import { apiClient } from '../lib/api';
import { notifyUser } from '../lib/notifications';

export function PartyBar() {
  const router = useRouter();
  const {
    members,
    maxSlots,
    status,
    isChatOpen,
    messages,
    inviteCode,
    toggleReady,
    setQueueStatus,
    toggleChat,
    sendMessage,
    setUserProfile,
  } = usePartyStore();

  const { activeGame } = useGameStore();

  const { data: userProfile } = useQuery<{ id: string; username: string; rating?: number } | null>({
    queryKey: ['party-bar-profile'],
    queryFn: () => apiClient<{ id: string; username: string; rating?: number }>('/profile/me').catch(() => null),
    staleTime: 60000,
  });

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Sync real profile into the party member state
  useEffect(() => {
    if (userProfile?.username) {
      setUserProfile(userProfile.username, userProfile.rating ?? 1000);
    }
  }, [userProfile, setUserProfile]);

  const emptySlotsCount = Math.max(0, maxSlots - members.length);
  const me = members.find((m) => m.id === 'me') || members[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    notifyUser('Squad Invite Copied!', {
      body: `Code ${inviteCode} copied to clipboard. Share with your teammates.`,
      sound: 'score',
      type: 'party',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActionClick = () => {
    if (!userProfile) {
      router.push('/login');
      return;
    }
    if (status === 'IN_QUEUE') {
      setQueueStatus('IDLE');
    } else {
      setQueueStatus('IN_QUEUE');
      router.push(`/matches/new${activeGame ? `?profileId=${activeGame.id}` : ''}`);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(me?.username || 'You', chatInput);
    setChatInput('');
  };

  return (
    <>
      {/* Slide-Up Party Chat Drawer */}
      {isChatOpen && (
        <div className="fixed bottom-16 sm:bottom-20 right-3 sm:right-6 z-50 w-80 sm:w-96 bg-[#111319] border border-[#202430] rounded-t-2xl shadow-2xl flex flex-col overflow-hidden text-white animate-in slide-in-from-bottom duration-200">
          <div className="p-3 bg-[#161922] border-b border-[#202430] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#D97736] font-bold">💬 Squad Chat</span>
              <span className="text-[10px] text-gray-400 font-mono">({members.length} in party)</span>
            </div>
            <button
              type="button"
              onClick={toggleChat}
              className="text-gray-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="p-3 h-64 overflow-y-auto flex flex-col gap-2 scrollbar-thin text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-2 rounded-lg ${
                  m.sender === 'SYSTEM'
                    ? 'bg-[#C86228]/10 border border-[#C86228]/30 text-gray-300 text-[11px]'
                    : m.sender === (me?.username || 'You')
                    ? 'bg-[#C86228]/20 ml-6 text-white'
                    : 'bg-[#161922] mr-6 text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5">
                  <span className="font-semibold text-gray-300">{m.sender}</span>
                  <span>{m.timestamp}</span>
                </div>
                <p>{m.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="p-2 bg-[#161922] border-t border-[#202430] flex gap-2">
            <input
              type="text"
              placeholder="Party message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-[#0B0C10] border border-[#202430] rounded-lg text-xs text-white focus:outline-none focus:border-[#C86228]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#C86228] hover:bg-[#D97736] font-bold text-xs rounded-lg text-white transition"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* When Minimized: Sleek Floating Squad Pill */}
      {isMinimized ? (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-[#111319] hover:bg-[#161922] border border-[#202430] rounded-full text-white text-xs font-bold shadow-2xl transition hover:scale-105"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Squad ({members.length}/{maxSlots})</span>
            <span className="text-[#D97736] font-mono">· Play VS ⚔️</span>
            <span className="text-gray-400 text-[10px]">▲</span>
          </button>
        </div>
      ) : (
        /* Main Bottom Dock Bar - Docked to main workspace (lg:left-60 leaving GameRail free) */
        <aside
          aria-label="Party dock"
          className="fixed bottom-0 left-0 lg:left-60 right-0 z-40 bg-[#0B0C10]/95 backdrop-blur-md border-t border-[#202430] h-16 sm:h-20 flex items-center justify-between px-3 sm:px-6 text-white shadow-2xl max-w-full overflow-x-hidden"
        >
          {/* Left: Party Info & Active Game */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="hidden sm:flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                Squad ({members.length}/{maxSlots})
              </span>
              <span className="text-xs font-bold text-white truncate max-w-[130px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="truncate">{activeGame?.displayName || 'Select Game'}</span>
              </span>
            </div>

            {/* Member Slots */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {members.map((member) => {
                const displayName = member.id === 'me' && userProfile?.username ? userProfile.username : member.username;
                const displayElo = member.id === 'me' && userProfile?.rating ? userProfile.rating : member.elo;
                const displayLevel = Math.min(10, Math.max(1, Math.floor(displayElo / 200) + 1));

                return (
                  <div
                    key={member.id}
                    className="relative group cursor-pointer flex-shrink-0"
                    title={`${displayName} (Lvl ${displayLevel} · ${displayElo} Elo)`}
                    onClick={() => member.id === 'me' && toggleReady()}
                  >
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs bg-[#161922] transition ${
                        member.isReady ? 'border-emerald-500' : 'border-[#C86228]'
                      }`}
                    >
                      {displayName.slice(0, 2).toUpperCase()}
                    </div>

                    {/* Level Badge Pip */}
                    <span className="absolute -bottom-1 -right-1 bg-black border border-gray-600 px-1 rounded text-[8px] sm:text-[9px] font-mono font-bold text-gray-300">
                      {displayLevel}
                    </span>

                    {/* Leader Crown */}
                    {member.isLeader && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px]">
                        👑
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Responsive Empty Slot Add Button */}
              {emptySlotsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(true)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-dashed border-gray-600 hover:border-[#C86228] hover:text-[#D97736] text-gray-500 flex items-center justify-center text-xs font-bold transition bg-[#111319]/50 flex-shrink-0"
                  title="Invite friend to squad"
                >
                  +
                </button>
              )}

              {/* Additional empty slots on desktop only */}
              {emptySlotsCount > 1 &&
                Array.from({ length: emptySlotsCount - 1 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInviteModalOpen(true)}
                    className="hidden md:flex w-10 h-10 rounded-full border border-dashed border-gray-700 hover:border-[#C86228] hover:text-[#D97736] text-gray-600 items-center justify-center text-xs font-bold transition bg-[#111319]/30 flex-shrink-0"
                    title="Invite friend to squad"
                  >
                    +
                  </button>
                ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 min-w-0">
            {/* Toggle Party Chat */}
            <button
              type="button"
              onClick={toggleChat}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition flex-shrink-0 ${
                isChatOpen
                  ? 'bg-[#C86228]/20 border-[#C86228] text-white'
                  : 'bg-[#111319] hover:bg-[#161922] border-[#202430] text-gray-300'
              }`}
              title="Toggle party chat"
            >
              <span>💬</span>
              <span className="hidden md:inline text-xs">Squad Chat</span>
            </button>

            {/* Ready Status Toggle */}
            <button
              type="button"
              onClick={() => toggleReady()}
              className={`px-2.5 sm:px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
                me?.isReady
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:border-amber-500'
              }`}
              title="Toggle Ready status"
            >
              <span className={`w-2 h-2 rounded-full ${me?.isReady ? 'bg-emerald-400' : 'bg-amber-500'}`} />
              <span className="hidden sm:inline text-xs">{me?.isReady ? 'READY' : 'NOT READY'}</span>
            </button>

            {/* Master "PLAY VS" Button */}
            <button
              type="button"
              onClick={handleActionClick}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase transition shadow-md flex items-center gap-1.5 sm:gap-2 select-none flex-shrink-0 ${
                status === 'IN_QUEUE'
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : 'bg-[#C86228] hover:bg-[#D97736] text-white shadow-[#C86228]/20'
              }`}
            >
              <span>⚔️</span>
              <span>{status === 'IN_QUEUE' ? 'IN QUEUE' : 'PLAY VS'}</span>
            </button>

            {/* Minimize Button */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 text-gray-500 hover:text-white text-xs flex-shrink-0"
              title="Minimize party dock"
            >
              ▼
            </button>
          </div>
        </aside>
      )}

      {/* Invite Squad Code Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#111319] border border-[#202430] p-6 rounded-2xl shadow-2xl flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between border-b border-[#202430] pb-3">
              <h3 className="font-bold text-sm">Squad Invite Code</h3>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="text-gray-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Share this code with teammates to squad up for competitive matchmaking.
            </p>

            <div className="flex items-center justify-between p-3 bg-[#0B0C10] border border-[#202430] rounded-xl font-mono text-sm font-bold text-[#D97736]">
              <span>{inviteCode}</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1 bg-[#161922] hover:bg-[#202430] text-white rounded text-xs transition border border-[#202430]"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setInviteModalOpen(false)}
              className="w-full py-2.5 bg-[#161922] hover:bg-[#202430] rounded-xl text-xs font-bold text-gray-300 hover:text-white transition border border-[#202430]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
