import { PHYSICAL_STABLE_READ } from '../constants';

import { parseIntLoose, type TypeEngine } from './TypeEngine';

import type { GameProfile, MatchContext, ParsedResult, ValidationResult, WinnerDecision } from '../types';
import type { MatchFormat } from '../constants';

/**
 * PHYSICAL — external challenges read from whiteboard or object count.
 * Validation enforces stable reads (same value N consecutive frames).
 */
export class PhysicalEngine implements TypeEngine {
  readonly type = 'PHYSICAL' as const;

  parse(rawText: string, profile: GameProfile): ParsedResult | null {
    const regex = profile.regexPattern ? new RegExp(profile.regexPattern) : /(\d+)/;
    const m = rawText.match(regex);
    if (!m) return null;
    const v = parseIntLoose(m[1] ?? '');
    if (v === null) return null;
    return { primary: v, raw: rawText, confidence: 0.9 };
  }

  validate(parsed: ParsedResult, ctx: MatchContext): ValidationResult {
    const errors: string[] = [];
    const required = ctx.profile.constraints.stableReads ?? PHYSICAL_STABLE_READ.requiredIdenticalReads;
    const player = ctx.playerA;

    const recent = ctx.previousFrames
      .filter((f) => f.playerId === player && f.parsed)
      .slice(-required);

    if (recent.length < required) {
      return { ok: false, confidence: 0.6, errors: ['insufficient reads for stable confirmation'] };
    }

    const values = recent.map((f) => f.parsed!.primary);
    const allSame = values.every((v) => v === values[0]);
    if (!allSame) {
      return { ok: false, confidence: 0.6, errors: ['reads not stable'] };
    }

    if (parsed.primary !== values[0]) {
      errors.push('current read does not match stable window');
    }

    return { ok: errors.length === 0, confidence: 0.95, errors };
  }

  compare(a: ParsedResult, b: ParsedResult, _format: MatchFormat): WinnerDecision {
    const av = Number(a.primary);
    const bv = Number(b.primary);
    if (av === bv) return { winnerId: null, reason: 'tie' };
    return av > bv
      ? { winnerId: 'A', reason: `${av} > ${bv}` }
      : { winnerId: 'B', reason: `${bv} > ${av}` };
  }
}
