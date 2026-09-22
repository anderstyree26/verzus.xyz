import type { GameProfile, ScoreFrame } from '../types';

export interface AntiCheatResult {
  suspicious: boolean;
  reasons: string[];
}

/**
 * Analyses a score stream for patterns consistent with cheating.
 * Cheap heuristics — no ML required.
 */
export function analyzeScoreStream(
  frames: ScoreFrame[],
  profile: GameProfile,
): AntiCheatResult {
  const reasons: string[] = [];

  const sorted = [...frames].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  // 1. Impossible velocity.
  const maxJump = profile.constraints.maxJumpPerSec;
  if (maxJump) {
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]!;
      const cur = sorted[i]!;
      if (typeof prev.parsed?.primary !== 'number' || typeof cur.parsed?.primary !== 'number') continue;
      const seconds = Math.max(0.001, (cur.createdAt.getTime() - prev.createdAt.getTime()) / 1000);
      const delta = cur.parsed.primary - prev.parsed.primary;
      if (delta > maxJump * seconds * 2) {
        reasons.push(`impossible velocity: ${delta} in ${seconds.toFixed(2)}s`);
        break;
      }
    }
  }

  // 2. Repeated identical frames (replay detection).
  const hashes = sorted.map((f) => f.imageHash).filter((h): h is string => !!h);
  const uniqueHashes = new Set(hashes);
  if (hashes.length >= 5 && uniqueHashes.size === 1) {
    reasons.push('identical frames across window — likely replay');
  }

  // 3. Values outside allowed range.
  const { min = -Infinity, max = Infinity } = profile.constraints;
  for (const f of sorted) {
    if (typeof f.parsed?.primary !== 'number') continue;
    if (f.parsed.primary < min || f.parsed.primary > max) {
      reasons.push(`value ${f.parsed.primary} outside [${min}, ${max}]`);
      break;
    }
  }

  return { suspicious: reasons.length > 0, reasons };
}
