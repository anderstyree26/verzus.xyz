'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePartyStore } from '../lib/partyStore';
import { useGameStore } from '../lib/gameStore';

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
  } = usePartyStore();

  const { activeGame } = useGameStore();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);

  const emptySlotsCount = Math.max(0, maxSlots - members.length);
  const me = members.find((m) => m.id === 'me') || members[0];
  const isLeader = me?.isLeader;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActionClick = () => {
    if (status === 'IN_QUEUE') {
      setQueueStatus('IDLE');
    } else {
      // If leader, route to Matchroom VS / Quick Play
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
        <div className="fixed bottom-16 sm:bottom-20 right-3 sm:right-6 z-50 w-80 sm:w-96 bg-[#12121A] border border-[#222232] rounded-t-2xl shadow-2xl flex flex-col overflow-hidden text-white animate-in slide-in-from-bottom duration-200">
          <div className="p-3 bg-[#181824] border-b border-[#222232] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#FF5500] font-bold">💬 Party Chat</span>
              <span className="text-[10px] text-gray-400 font-mono">({members.length} online)</span>
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
                    ? 'bg-[#FF5500]/10 border border-[#FF5500]/30 text-gray-300 text-[11px]'
                    : m.sender === (me?.username || 'You')
                    ? 'bg-[#FF5500]/20 ml-6 text-white'
                    : 'bg-surface mr-6 text-gray-200'
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

          <form onSubmit={handleSendChat} className="p-2 bg-[#181824] border-t border-[#222232] flex gap-2">
            <input
              type="text"
              placeholder="Party message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-surface border border-surface-border rounded-md text-xs text-white focus:outline-none focus:border-[#FF5500]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#FF5500] hover:bg-[#FF4400] text-xs font-bold rounded-md text-white transition"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Main Bottom Dock Bar */}
      <aside aria-label="Party dock" className="fixed bottom-0 left-0 right-0 z-40 bg-[#0C0C12]/95 backdrop-blur-md border-t border-[#1E1E2C] h-16 sm:h-20 flex items-center justify-between px-3 sm:px-6 text-white shadow-2xl">
        {/* Left: Party Info & Active Game */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              Squad ({members.length}/{maxSlots})
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[140px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {activeGame?.displayName || 'Select Game'}
            </span>
          </div>

          {/* Member Slots */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="relative group cursor-pointer"
                title={`${member.username} (Lvl ${member.level} · ${member.elo} Elo)`}
                onClick={() => member.id === 'me' && toggleReady()}
              >
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center font-bold text-xs bg-surface transition ${
                    member.isReady ? 'border-green-500' : 'border-[#FF5500]'
                  }`}
                >
                  {member.username.slice(0, 2).toUpperCase()}
                </div>

                {/* Level Badge Pip */}
                <span className="absolute -bottom-1 -right-1 bg-black border border-gray-600 px-1 rounded text-[9px] font-mono font-bold text-gray-300">
                  {member.level}
                </span>

                {/* Leader Crown */}
                {member.isLeader && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px]">
                    👑
                  </span>
                )}
              </div>
            ))}

            {/* Empty Slots (+) */}
            {Array.from({ length: emptySlotsCount }).map((_, i) => (
              <button
                key={`empty-${i}`}
                type="button"
                onClick={() => setInviteModalOpen(true)}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-dashed border-gray-600 hover:border-[#FF5500] hover:text-[#FF5500] text-gray-500 flex items-center justify-center text-sm font-bold transition bg-surface/50"
                title="Invite friend to squad"
              >
                +
              </button>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Chat Toggle Button */}
          <button
            type="button"
            onClick={toggleChat}
            className={`p-2 sm:px-3 sm:py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
              isChatOpen
                ? 'bg-[#FF5500] border-[#FF5500] text-white'
                : 'bg-surface hover:bg-surface-elevated border-surface-border text-gray-300'
            }`}
            title="Toggle party chat"
          >
            <span>💬</span>
            <span className="hidden md:inline">Party Chat</span>
          </button>

          {/* Ready Check Indicator */}
          <button
            type="button"
            onClick={() => toggleReady()}
            className={`px-3 py-2 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${
              me?.isReady
                ? 'bg-green-600/20 border-green-500 text-green-400'
                : 'bg-surface border-gray-600 text-gray-400 hover:border-gray-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${me?.isReady ? 'bg-green-400' : 'bg-gray-500'}`} />
            <span className="hidden sm:inline">{me?.isReady ? 'READY' : 'NOT READY'}</span>
          </button>

          {/* Master "PLAY VS" Button (Signature FACEIT Orange) */}
          <button
            type="button"
            onClick={handleActionClick}
            className={`px-4 sm:px-7 py-2.5 sm:py-3 rounded-lg font-black text-xs sm:text-sm tracking-wider uppercase transition shadow-lg flex items-center gap-2 select-none ${
              status === 'IN_QUEUE'
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-[#FF5500] hover:bg-[#FF4400] text-white shadow-[0_0_20px_rgba(255,85,0,0.5)]'
            }`}
          >
            <span>⚔️</span>
            <span>{status === 'IN_QUEUE' ? 'IN QUEUE · CANCEL' : 'PLAY VS'}</span>
          </button>
        </div>
      </aside>

      {/* Invite Squad Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#12121A] border border-[#222232] rounded-2xl p-6 text-white flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div>
                <h3 className="text-lg font-bold">Invite Squad Members</h3>
                <p className="text-xs text-gray-400">Share your party code or link to queue together.</p>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-surface rounded-xl border border-surface-border flex flex-col items-center justify-center gap-2">
              <span className="text-xs text-gray-400">Your Squad Room Code:</span>
              <span className="font-mono text-2xl font-black text-[#FF5500] tracking-widest">
                {inviteCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="mt-1 px-4 py-1.5 bg-[#FF5500] hover:bg-[#FF4400] text-xs font-bold rounded-md transition"
              >
                {copied ? '✓ Copied to Clipboard!' : 'Copy Invite Code'}
              </button>
            </div>

            <p className="text-[11px] text-gray-400 text-center">
              Party members automatically join your matchroom and queue together for team cups or 1v1 challenges.
            </p>

            <button
              type="button"
              onClick={() => setInviteModalOpen(false)}
              className="w-full py-2 bg-surface hover:bg-surface-elevated border border-surface-border rounded-lg text-xs font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
