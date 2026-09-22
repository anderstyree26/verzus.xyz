import { parseTimeToMs, type TypeEngine } from './TypeEngine';

import type { GameProfile, MatchContext, ParsedResult, ValidationResult, WinnerDecision } from '../types';
import type { MatchFormat } from '../constants';

/** LOW_TIME — fastest time wins (racing, speedruns). */
export class LowTimeEngine implements TypeEngine {
  readonly type = 'LOW_TIME' as const;

  parse(rawText: string, profile: GameProfile): ParsedResult | null {
    const regex = profile.regexPattern
      ? new RegExp(profile.regexPattern)
      : /(\d{1,3}:\d{2}(?:[.:]\d{1,3})?)/;
    const m = rawText.match(regex);
    if (!m) return null;
    const ms = parseTimeToMs(m[1] ?? '');
    if (ms === null) return null;
    return { primary: ms, raw: rawText, confidence: 0.95 };
  }

  validate(parsed: ParsedResult, ctx: MatchContext): ValidationResult {
    const errors: string[] = [];
    const ms = typeof parsed.primary === 'number' ? parsed.primary : NaN;
    const min = ctx.profile.constraints.min ?? 0;
    const max = ctx.profile.constraints.max ?? 86_400_000;

    if (!Number.isFinite(ms)) errors.push('value is not a valid duration');
    else if (ms < min) errors.push(`time ${ms}ms < min ${min}ms`);
    else if (ms > max) errors.push(`time ${ms}ms > max ${max}ms`);

    return { ok: errors.length === 0, confidence: parsed.confidence, errors };
  }

  compare(a: ParsedResult, b: ParsedResult, _format: MatchFormat): WinnerDecision {
    const av = Number(a.primary);
    const bv = Number(b.primary);
    if (av === bv) return { winnerId: null, reason: 'tie' };
    return av < bv
      ? { winnerId: 'A', reason: `${av}ms < ${bv}ms` }
      : { winnerId: 'B', reason: `${bv}ms < ${av}ms` };
  }

  detectEnd(rawText: string, profile: GameProfile): boolean {
    const lower = rawText.toLowerCase();
    return profile.endKeywords.some((kw) => lower.includes(kw.toLowerCase()));
  }
}
