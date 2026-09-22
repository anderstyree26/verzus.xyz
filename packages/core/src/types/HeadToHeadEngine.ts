import { parseIntLoose, type TypeEngine } from './TypeEngine';

import type { GameProfile, MatchContext, ParsedResult, ValidationResult, WinnerDecision } from '../types';
import type { MatchFormat } from '../constants';

/**
 * HEAD_TO_HEAD — same match, both players' scores on one screen.
 * Regex must contain named groups `a` and `b` or two capture groups.
 * Example: `Score A: (\d+) Score B: (\d+)`
 */
export class HeadToHeadEngine implements TypeEngine {
  readonly type = 'HEAD_TO_HEAD' as const;

  parse(rawText: string, profile: GameProfile): ParsedResult | null {
    if (!profile.regexPattern) return null;
    const regex = new RegExp(profile.regexPattern);
    const m = rawText.match(regex);
    if (!m) return null;
    const a = parseIntLoose(m.groups?.a ?? m[1] ?? '');
    const b = parseIntLoose(m.groups?.b ?? m[2] ?? '');
    if (a === null || b === null) return null;
    return {
      primary: a,
      fields: { a, b },
      raw: rawText,
      confidence: 0.95,
    };
  }

  validate(parsed: ParsedResult, _ctx: MatchContext): ValidationResult {
    const errors: string[] = [];
    const a = parsed.fields?.a;
    const b = parsed.fields?.b;
    if (typeof a !== 'number' || typeof b !== 'number') errors.push('missing scores for A or B');
    return { ok: errors.length === 0, confidence: parsed.confidence, errors };
  }

  compare(a: ParsedResult, _b: ParsedResult, _format: MatchFormat): WinnerDecision {
    const sa = Number(a.fields?.a);
    const sb = Number(a.fields?.b);
    if (!Number.isFinite(sa) || !Number.isFinite(sb)) return { winnerId: null, reason: 'incomplete' };
    if (sa === sb) return { winnerId: null, reason: 'draw' };
    return sa > sb
      ? { winnerId: 'A', reason: `${sa} > ${sb}` }
      : { winnerId: 'B', reason: `${sb} > ${sa}` };
  }
}
