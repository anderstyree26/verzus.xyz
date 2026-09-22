import { CONFIDENCE } from '../constants';

import { parseIntLoose, type TypeEngine } from './TypeEngine';

import type { GameProfile, MatchContext, ParsedResult, ValidationResult, WinnerDecision } from '../types';
import type { MatchFormat } from '../constants';

/**
 * HIGH_SCORE — highest numeric value wins.
 * Example: Temple Run, Subway Surfers, arcade.
 */
export class HighScoreEngine implements TypeEngine {
  readonly type = 'HIGH_SCORE' as const;

  parse(rawText: string, profile: GameProfile): ParsedResult | null {
    const regex = profile.regexPattern
      ? new RegExp(profile.regexPattern)
      : /([0-9][0-9,\.]*)/;
    const match = rawText.match(regex);
    if (!match) return null;
    const value = parseIntLoose(match[1] ?? '');
    if (value === null) return null;
    return { primary: value, raw: rawText, confidence: 0.95 };
  }

  validate(parsed: ParsedResult, ctx: MatchContext): ValidationResult {
    const errors: string[] = [];
    const value = typeof parsed.primary === 'number' ? parsed.primary : NaN;
    const { min = 0, max = Number.MAX_SAFE_INTEGER, maxJumpPerSec } = ctx.profile.constraints;

    if (!Number.isFinite(value)) errors.push('value is not numeric');
    else if (value < min) errors.push(`value ${value} < min ${min}`);
    else if (value > max) errors.push(`value ${value} > max ${max}`);

    const previous = lastPrimaryFor(ctx, ctx.playerA) ?? lastPrimaryFor(ctx, ctx.playerB);
    if (previous !== null && maxJumpPerSec) {
      const previousTime = lastFrameTimeFor(ctx);
      if (previousTime) {
        const deltaSec = Math.max(0.001, (Date.now() - previousTime) / 1000);
        const allowed = maxJumpPerSec * deltaSec;
        if (value - previous > allowed + maxJumpPerSec) {
          errors.push(`jump of ${value - previous} exceeds ${allowed.toFixed(0)} per window`);
        }
      }
    }

    return { ok: errors.length === 0, confidence: parsed.confidence, errors };
  }

  compare(a: ParsedResult, b: ParsedResult, _format: MatchFormat): WinnerDecision {
    const av = Number(a.primary);
    const bv = Number(b.primary);
    if (av === bv) return { winnerId: null, reason: 'tie' };
    return av > bv
      ? { winnerId: 'A', reason: `${av} > ${bv}` }
      : { winnerId: 'B', reason: `${bv} > ${av}` };
  }

  detectEnd(rawText: string, profile: GameProfile): boolean {
    if (profile.endKeywords.length === 0) return false;
    const lower = rawText.toLowerCase();
    return profile.endKeywords.some((kw) => lower.includes(kw.toLowerCase()));
  }
}

function lastPrimaryFor(ctx: MatchContext, playerId: string): number | null {
  const frames = ctx.previousFrames.filter((f) => f.playerId === playerId && f.parsed);
  const last = frames[frames.length - 1];
  if (!last || !last.parsed) return null;
  return typeof last.parsed.primary === 'number' ? last.parsed.primary : null;
}

function lastFrameTimeFor(ctx: MatchContext): number | null {
  const last = ctx.previousFrames[ctx.previousFrames.length - 1];
  return last ? last.createdAt.getTime() : null;
}

void CONFIDENCE;
