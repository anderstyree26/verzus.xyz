'use client';

import { create } from 'zustand';

export interface PartyMember {
  id: string;
  username: string;
  avatarUrl?: string;
  level: number; // FACEIT-style Level 1 to 10
  elo: number;
  isLeader: boolean;
  isReady: boolean;
}

export interface PartyMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export type PartyQueueStatus = 'IDLE' | 'IN_QUEUE' | 'MATCH_FOUND' | 'READY_CHECK';

interface PartyState {
  partyId: string;
  inviteCode: string;
  members: PartyMember[];
  maxSlots: number;
  status: PartyQueueStatus;
  isChatOpen: boolean;
  messages: PartyMessage[];

  // Actions
  toggleReady: (memberId?: string) => void;
  setQueueStatus: (status: PartyQueueStatus) => void;
  toggleChat: () => void;
  sendMessage: (sender: string, text: string) => void;
  addMember: (member: Omit<PartyMember, 'isLeader' | 'isReady'>) => void;
  removeMember: (memberId: string) => void;
}

export const usePartyStore = create<PartyState>((set, get) => ({
  partyId: 'party-local',
  inviteCode: 'VX8942',
  maxSlots: 5,
  status: 'IDLE',
  isChatOpen: false,

  // Initial user in party (default leader)
  members: [
    {
      id: 'me',
      username: 'PlayerOne',
      level: 7,
      elo: 1650,
      isLeader: true,
      isReady: true,
    },
  ],

  messages: [
    {
      id: 'm1',
      sender: 'SYSTEM',
      text: 'Party created. Invite squad members with code VX8942.',
      timestamp: 'Just now',
    },
  ],

  toggleReady: (memberId = 'me') => {
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, isReady: !m.isReady } : m
      ),
    }));
  },

  setQueueStatus: (status) => set({ status }),

  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  sendMessage: (sender, text) => {
    if (!text.trim()) return;
    const newMsg: PartyMessage = {
      id: `msg-${Date.now()}`,
      sender,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    set((state) => ({ messages: [...state.messages, newMsg] }));
  },

  addMember: (member) => {
    const { members, maxSlots } = get();
    if (members.length >= maxSlots) return;
    const newMember: PartyMember = {
      ...member,
      isLeader: false,
      isReady: false,
    };
    set({ members: [...members, newMember] });
  },

  removeMember: (memberId) => {
    set((state) => ({
      members: state.members.filter((m) => m.id !== memberId),
    }));
  },
}));
