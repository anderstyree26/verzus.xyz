import type { GameProfile, ParsedResult, ScoreFrame, ValidationResult } from '../types';
import { getEngine } from '../types/TypeRegistry';
import type { MatchContext } from '../types';

/**
 * Calculates Levenshtein distance between two strings for fuzzy OCR matching.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array<number>(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    const charA = a.charAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const charB = b.charAt(j - 1);
      const cost = charA === charB ? 0 : 1;
      const insertCost = (curr[j - 1] ?? 0) + 1;
      const deleteCost = (prev[j] ?? 0) + 1;
      const replaceCost = (prev[j - 1] ?? 0) + cost;
      curr[j] = Math.min(insertCost, deleteCost, replaceCost);
    }
    const temp = prev;
    prev = curr;
    curr = temp;
  }
  return prev[n] ?? 0;
}

/**
 * Normalizes gamertags and OCR text for comparison, substituting common OCR confusions.
 */
function normalizeForMatching(text: string): string {
  return text
    .toLowerCase()
    .replace(/[0o]/g, 'o')
    .replace(/[1li|]/g, 'l')
    .replace(/[5s]/g, 's')
    .replace(/[2z]/g, 'z')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Verifies that the expected player's gamertag appears within the OCR raw text.
 * Prevents players from streaming another player's Twitch VOD or YouTube match.
 */
export function verifyGamertagBinding(
  rawText: string,
  expectedGamertag?: string
): { matched: boolean; confidence: number; reason?: string } {
  if (!expectedGamertag || expectedGamertag.trim() === '') {
    return { matched: true, confidence: 1.0 };
  }

  const normTarget = normalizeForMatching(expectedGamertag);
  if (normTarget.length === 0) {
    return { matched: true, confidence: 1.0 };
  }

  const normRaw = normalizeForMatching(rawText);

  // Exact substring match after OCR normalization
  if (normRaw.includes(normTarget)) {
    return { matched: true, confidence: 1.0 };
  }

  // Sliding window fuzzy match
  const targetLen = normTarget.length;
  const maxAllowedDist = Math.max(1, Math.floor(targetLen * 0.25));

  for (let i = 0; i <= normRaw.length - targetLen; i++) {
    const windowSlice = normRaw.slice(i, i + targetLen);
    const dist = levenshteinDistance(normTarget, windowSlice);
    if (dist <= maxAllowedDist) {
      const confidence = Math.max(0.7, 1 - dist / targetLen);
      return { matched: true, confidence };
    }
  }

  return {
    matched: false,
    confidence: 0.2,
    reason: `Gamertag '${expectedGamertag}' was not detected in HUD/scoreboard text (potential stream hijack)`,
  };
}

/**
 * Runs the type engine's validate, plus generic temporal checks and gamertag binding.
 */
export function validateParsed(
  parsed: ParsedResult,
  ctx: MatchContext,
  activePlayerId?: string
): ValidationResult {
  const engine = getEngine(ctx.profile.gameType);
  const base = engine.validate(parsed, ctx);

  const generic = genericTemporalChecks(parsed, ctx);
  const errors = [...base.errors, ...generic];

  // Gamertag binding check
  const activeId = activePlayerId || ctx.activePlayerId;
  let expectedTag: string | undefined;
  if (activeId === ctx.playerA || activeId === 'A') {
    expectedTag = ctx.gamertags?.playerA;
  } else if (activeId === ctx.playerB || activeId === 'B') {
    expectedTag = ctx.gamertags?.playerB;
  }

  let finalConfidence = base.confidence;
  if (expectedTag) {
    const binding = verifyGamertagBinding(parsed.raw, expectedTag);
    if (!binding.matched) {
      errors.push(binding.reason || `Gamertag '${expectedTag}' missing from OCR stream`);
      finalConfidence = Math.min(finalConfidence, binding.confidence);
    }
  }

  const ok = base.ok && errors.length === 0;

  return { ok, confidence: finalConfidence, errors, corrected: base.corrected };
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
