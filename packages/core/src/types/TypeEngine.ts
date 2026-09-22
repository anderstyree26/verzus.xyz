import type {
  GameProfile,
  MatchContext,
  ParsedResult,
  ValidationResult,
  WinnerDecision,
} from '../types';
import type { GameType, MatchFormat } from '../constants';

export interface TypeEngine {
  readonly type: GameType;
  /** Convert raw OCR text into a structured result. Null = parse failure. */
  parse(rawText: string, profile: GameProfile): ParsedResult | null;
  /** Validate a parsed result against game rules and match history. */
  validate(parsed: ParsedResult, ctx: MatchContext): ValidationResult;
  /** Decide the winner from two parsed results. Null winner = draw. */
  compare(a: ParsedResult, b: ParsedResult, format: MatchFormat): WinnerDecision;
  /** Optional: detect end-of-match from raw text. */
  detectEnd?(rawText: string, profile: GameProfile): boolean;
}

/** Strip commas and whitespace, then parse as integer. */
export function parseIntLoose(input: string): number | null {
  const cleaned = input.replace(/[,\s]/g, '');
  const n = Number.parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : null;
}

/** Parse a duration "mm:ss" or "mm:ss.ms" to milliseconds. */
export function parseTimeToMs(input: string): number | null {
  const m = input.trim().match(/^(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?$/);
  if (!m) return null;
  const minutes = Number.parseInt(m[1]!, 10);
  const seconds = Number.parseInt(m[2]!, 10);
  const fracRaw = m[3] ?? '';
  const ms = fracRaw.length === 0 ? 0
    : fracRaw.length === 1 ? Number.parseInt(fracRaw, 10) * 100
    : fracRaw.length === 2 ? Number.parseInt(fracRaw, 10) * 10
    : Number.parseInt(fracRaw, 10);
  if (seconds >= 60) return null;
  return (minutes * 60 + seconds) * 1000 + ms;
}
