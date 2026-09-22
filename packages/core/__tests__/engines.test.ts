import { describe, it, expect } from 'vitest';
import { TypeRegistry, getEngine } from '../src/types/TypeRegistry';
import type { GameProfile } from '../src/types';

describe('TypeEngines Suite', () => {
  it('registers all 8 engines', () => {
    expect(Object.keys(TypeRegistry)).toHaveLength(8);
  });

  it('HighScoreEngine parses and compares correctly', () => {
    const engine = getEngine('HIGH_SCORE');
    const profile: GameProfile = {
      id: 'p1',
      displayName: 'High Score Test',
      gameType: 'HIGH_SCORE',
      platform: 'MOBILE',
      roi: { x: 0, y: 0, w: 1, h: 1 },
      constraints: { min: 0, max: 100000 },
      endKeywords: ['game over'],
      approved: true,
      isOfficial: true,
    };

    const parsedA = engine.parse('Final Score: 12,450', profile);
    const parsedB = engine.parse('Final Score: 8,300', profile);

    expect(parsedA).not.toBeNull();
    expect(parsedA?.primary).toBe(12450);

    const decision = engine.compare(parsedA!, parsedB!, 'BO1');
    expect(decision.winnerId).toBe('A');
  });

  it('LowTimeEngine parses time and compares correctly (lower is better)', () => {
    const engine = getEngine('LOW_TIME');
    const profile: GameProfile = {
      id: 'p2',
      displayName: 'Time Trial',
      gameType: 'LOW_TIME',
      platform: 'PC',
      roi: { x: 0, y: 0, w: 1, h: 1 },
      constraints: {},
      endKeywords: ['finished'],
      approved: true,
      isOfficial: true,
    };

    const fast = engine.parse('Time 01:23.45', profile);
    const slow = engine.parse('Time 01:25.10', profile);

    expect(fast).not.toBeNull();
    expect(slow).not.toBeNull();

    const decision = engine.compare(fast!, slow!, 'BO1');
    expect(decision.winnerId).toBe('A'); // fast (lower ms) wins
  });

  it('BinaryResultEngine detects victory vs defeat', () => {
    const engine = getEngine('BINARY_RESULT');
    const profile: GameProfile = {
      id: 'p3',
      displayName: 'Win/Loss',
      gameType: 'BINARY_RESULT',
      platform: 'MOBILE',
      roi: { x: 0, y: 0, w: 1, h: 1 },
      constraints: {},
      endKeywords: ['victory', 'defeat'],
      approved: true,
      isOfficial: true,
    };

    const parsedA = engine.parse('VICTORY!', profile);
    const parsedB = engine.parse('DEFEAT', profile);

    expect(parsedA?.primary).toBe('WIN');
    expect(parsedB?.primary).toBe('LOSS');

    const decision = engine.compare(parsedA!, parsedB!, 'BO1');
    expect(decision.winnerId).toBe('A');
  });
});
