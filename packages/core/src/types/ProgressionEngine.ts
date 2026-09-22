import { parseIntLoose, type TypeEngine } from './TypeEngine';

import type { GameProfile, MatchContext, ParsedResult, ValidationResult, WinnerDecision } from '../types';
import type { MatchFormat } from '../constants';

/**
 * PROGRESSION — rank (ordered list) + numeric value.
 * `profile.constraints.ranks` is ordered lowest → highest.
 */
export class ProgressionEngine implements TypeEngine {
  readonly type = 'PROGRESSION' as const;

  parse(rawText: string, profile: GameProfile): ParsedResult | null {
    const ranks = profile.constraints.ranks ?? [];
    const lower = rawText.toLowerCase();

    let matchedRank: string | null = null;
    for (const r of ranks) {
      if (lower.includes(r.toLowerCase())) {
        matchedRank = r;
        break;
      }
    }

    const regex = profile.regexPattern ? new RegExp(profile.regexPattern) : /(\d+)/;
    const numMatch = rawText.match(regex);
    const num = numMatch ? parseIntLoose(numMatch[1] ?? '') : null;

    if (!matchedRank && num === null) return null;

    return {
      primary: matchedRank ?? num ?? 'UNKNOWN',
      fields: {
        ...(matchedRank ? { rank: matchedRank } : {}),
        ...(num !== null ? { value: num } : {}),
      },
      raw: rawText,
      confidence: matchedRank ? 0.95 : 0.85,
    };
  }

  validate(parsed: ParsedResult, ctx: MatchContext): ValidationResult {
    const errors: string[] = [];
    const ranks = ctx.profile.constraints.ranks ?? [];
    if (ranks.length > 0 && typeof parsed.primary === 'string' && parsed.primary !== 'UNKNOWN') {
      if (!ranks.includes(parsed.primary)) errors.push(`unknown rank ${parsed.primary}`);
    }
    return { ok: errors.length === 0, confidence: parsed.confidence, errors };
  }

  compare(a: ParsedResult, b: ParsedResult, _format: MatchFormat): WinnerDecision {
    const rankA = a.fields?.rank;
    const rankB = b.fields?.rank;

    const vA = Number(a.fields?.value ?? a.primary);
    const vB = Number(b.fields?.value ?? b.primary);
    if (Number.isFinite(vA) && Number.isFinite(vB) && vA !== vB) {
      return vA > vB ? { winnerId: 'A', reason: `${vA} > ${vB}` } : { winnerId: 'B', reason: `${vB} > ${vA}` };
    }
    if (typeof rankA === 'string' && typeof rankB === 'string') {
      return rankA === rankB ? { winnerId: null, reason: 'same rank' } : { winnerId: null, reason: 'different ranks' };
    }
    return { winnerId: null, reason: 'cannot compare progression values' };
  }
}
