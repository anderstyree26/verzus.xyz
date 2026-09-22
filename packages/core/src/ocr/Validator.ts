import type { GameProfile, ParsedResult, ScoreFrame, ValidationResult } from '../types';
import { getEngine } from '../types/TypeRegistry';
import type { MatchContext } from '../types';

/**
 * Runs the type engine's validate, plus generic temporal checks.
 */
export function validateParsed(
  parsed: ParsedResult,
  ctx: MatchContext,
): ValidationResult {
  const engine = getEngine(ctx.profile.gameType);
  const base = engine.validate(parsed, ctx);

  const generic = genericTemporalChecks(parsed, ctx);
  const errors = [...base.errors, ...generic];
  const ok = base.ok && generic.length === 0;

  return { ok, confidence: base.confidence, errors, corrected: base.corrected };
}

function genericTemporalChecks(parsed: ParsedResult, ctx: MatchContext): string[] {
  const errors: string[] = [];
  const numeric = typeof parsed.primary === 'number' ? parsed.primary : null;
  if (numeric === null) return errors;

  const frames = ctx.previousFrames.filter((f) => f.playerId === ctx.playerA || f.playerId === ctx.playerB);
  if (frames.length === 0) return errors;

  const last = frames[frames.length - 1]!;
  const lastNumeric = last.parsed && typeof last.parsed.primary === 'number' ? last.parsed.primary : null;

  // Never drop for HIGH_SCORE / SURVIVAL unless explicit reset keyword present.
  if (
    lastNumeric !== null &&
    numeric < lastNumeric &&
    ['HIGH_SCORE', 'SURVIVAL', 'COMPOSITE_STAT'].includes(ctx.profile.gameType) &&
    !ctx.profile.endKeywords.some((kw) => parsed.raw.toLowerCase().includes(kw.toLowerCase()))
  ) {
    errors.push(`value regressed from ${lastNumeric} to ${numeric}`);
  }

  // Jump protection.
  const maxJump = ctx.profile.constraints.maxJumpPerSec;
  if (maxJump && lastNumeric !== null) {
    const seconds = Math.max(0.001, (Date.now() - last.createdAt.getTime()) / 1000);
    if (numeric - lastNumeric > maxJump * seconds + maxJump) {
      errors.push(`impossible jump ${lastNumeric} -> ${numeric}`);
    }
  }

  return errors;
}

/** Reduce a batch of frames to the latest per player. */
export function latestPerPlayer(frames: ScoreFrame[]): { a?: ScoreFrame; b?: ScoreFrame } {
  const out: { a?: ScoreFrame; b?: ScoreFrame } = {};
  for (const f of frames) {
    if (f.playerId === 'A') out.a = f;
    if (f.playerId === 'B') out.b = f;
  }
  return out;
}

export type { ScoreFrame, GameProfile };
