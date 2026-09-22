import { MATCH_TRANSITIONS, type MatchStatus } from '../constants';
import { MatchStateError } from '../errors';

/** Returns true if `to` is a legal next state from `from`. */
export function canTransition(from: MatchStatus, to: MatchStatus): boolean {
  const allowed = MATCH_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
}

/** Throws if the transition is not allowed. */
export function assertTransition(from: MatchStatus, to: MatchStatus): void {
  if (!canTransition(from, to)) {
    throw new MatchStateError(`Illegal transition ${from} -> ${to}`, { from, to });
  }
}

/** Terminal states where no further transitions are allowed. */
export function isTerminal(status: MatchStatus): boolean {
  return status === 'SETTLED' || status === 'CANCELLED';
}
