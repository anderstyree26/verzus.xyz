import type { TypeEngine } from './TypeEngine';

import type { GameProfile, MatchContext, ParsedResult, ValidationResult, WinnerDecision } from '../types';
import type { MatchFormat } from '../constants';

/**
 * COMPOSITE_STAT — weighted formula over multiple fields.
 * `profile.constraints.weights` maps field name -> weight.
 * `profile.regexPattern` must use named groups matching the weight keys.
 */
export class CompositeStatEngine implements TypeEngine {
  readonly type = 'COMPOSITE_STAT' as const;

  parse(rawText: string, profile: GameProfile): ParsedResult | null {
    if (!profile.regexPattern) return null;
    const regex = new RegExp(profile.regexPattern);
    const m = rawText.match(regex);
    if (!m?.groups) return null;

    const fields: Record<string, number> = {};
    for (const [k, v] of Object.entries(m.groups)) {
      const n = Number.parseFloat(String(v));
      if (Number.isFinite(n)) fields[k] = n;
    }

    const weights = profile.constraints.weights ?? {};
    let score = 0;
    let totalWeight = 0;
    for (const [k, w] of Object.entries(weights)) {
      const v = fields[k];
      if (typeof v === 'number') {
        score += v * w;
        totalWeight += Math.abs(w);
      }
    }
    if (totalWeight === 0) return null;

    return {
      primary: Number(score.toFixed(4)),
      fields,
      raw: rawText,
      confidence: 0.9,
    };
  }

  validate(parsed: ParsedResult, ctx: MatchContext): ValidationResult {
    const errors: string[] = [];
    if (typeof parsed.primary !== 'number') errors.push('composite score not numeric');
    const max = ctx.profile.constraints.max;
    if (max && typeof parsed.primary === 'number' && parsed.primary > max) {
      errors.push(`composite ${parsed.primary} > max ${max}`);
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
}
