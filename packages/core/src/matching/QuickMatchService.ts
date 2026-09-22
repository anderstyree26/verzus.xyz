import type { TypedSupabaseClient } from '@antigravity/db';

import { DEFAULT_ELO, QUICK_MATCH_ELO_WINDOW, type GameType, type MatchFormat } from '../constants';
import { namedLogger } from '../logger';

import { MatchService } from './MatchService';

const log = namedLogger('QuickMatch');

export interface QueueTicket {
  userId: string;
  profileId: string;
  gameType: GameType;
  format: MatchFormat;
  rating: number;
  enqueuedAt: number;
}

export interface QuickMatchDeps {
  client: TypedSupabaseClient;
  matchService: MatchService;
}

/**
 * In-memory quick-match queue keyed by gameType.
 * Proximity-based matching on ELO.
 */
export class QuickMatchService {
  private queues = new Map<GameType, QueueTicket[]>();

  constructor(private readonly deps: QuickMatchDeps) {}

  async enqueue(userId: string, profileId: string, gameType: GameType, format: MatchFormat): Promise<void> {
    const rating = await this.getRating(userId, gameType);
    const ticket: QueueTicket = { userId, profileId, gameType, format, rating, enqueuedAt: Date.now() };
    const q = this.queues.get(gameType) ?? [];
    q.push(ticket);
    this.queues.set(gameType, q);

    await this.tryMatch(gameType);
  }

  async dequeue(userId: string, gameType: GameType): Promise<void> {
    const q = this.queues.get(gameType);
    if (!q) return;
    const idx = q.findIndex((t) => t.userId === userId);
    if (idx >= 0) q.splice(idx, 1);
  }

  private async tryMatch(gameType: GameType): Promise<void> {
    const q = this.queues.get(gameType);
    if (!q || q.length < 2) return;

    const sorted = [...q].sort((a, b) => a.enqueuedAt - b.enqueuedAt);

    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i]!;
        const b = sorted[j]!;
        if (a.userId === b.userId) continue;
        if (Math.abs(a.rating - b.rating) > QUICK_MATCH_ELO_WINDOW) continue;

        await this.deps.matchService.create({
          creatorId: a.userId,
          profileId: a.profileId,
          playerA: a.userId,
          playerB: b.userId,
          format: a.format,
        });
        await this.dequeue(a.userId, gameType);
        await this.dequeue(b.userId, gameType);
        log.info({ a: a.userId, b: b.userId, gameType }, 'quick match created');
        return;
      }
    }
  }

  private async getRating(userId: string, gameType: GameType): Promise<number> {
    const { data } = await this.deps.client
      .from('ratings')
      .select('rating')
      .eq('user_id', userId)
      .eq('game_type', gameType)
      .maybeSingle();
    return data?.rating ?? DEFAULT_ELO;
  }
}
