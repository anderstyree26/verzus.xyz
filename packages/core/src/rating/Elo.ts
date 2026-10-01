import { DEFAULT_ELO, ELO_K_FACTOR } from '../constants';

/**
 * Standard Elo with K-factor 32.
 * @param ratingA Current rating of A
 * @param ratingB Current rating of B
 * @param aWon    true if A won, false if B won
 * @returns       [newA, newB]
 */
export function calculateElo(
  ratingA: number,
  ratingB: number,
  aWon: boolean | null,
): [number, number] {
  const rA = Number.isFinite(ratingA) && ratingA > 0 ? ratingA : DEFAULT_ELO;
  const rB = Number.isFinite(ratingB) && ratingB > 0 ? ratingB : DEFAULT_ELO;

  // Clamp exponent difference to [-20, 20] to prevent mathematical overflow
  const exponent = Math.max(-20, Math.min(20, (rB - rA) / 400));
  const expectedA = 1 / (1 + 10 ** exponent);
  const expectedB = 1 - expectedA;

  let scoreA: number;
  let scoreB: number;
  if (aWon === null || aWon === undefined) {
    scoreA = 0.5;
    scoreB = 0.5;
  } else if (aWon) {
    scoreA = 1;
    scoreB = 0;
  } else {
    scoreA = 0;
    scoreB = 1;
  }

  const newA = Math.round(rA + ELO_K_FACTOR * (scoreA - expectedA));
  const newB = Math.round(rB + ELO_K_FACTOR * (scoreB - expectedB));

  return [Math.max(100, newA), Math.max(100, newB)];
}

export { DEFAULT_ELO };

