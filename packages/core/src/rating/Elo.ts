import { DEFAULT_ELO, ELO_K_FACTOR } from '../constants';

/**
 * Standard Elo with K-factor 32.
 * @param ratingA Current rating of A
 * @param ratingB Current rating of B
 * @param aWon    true if A won, false if B won
 * @returns       [newA, newB]
 */
export function calculateElo(ratingA: number, ratingB: number, aWon: boolean): [number, number] {
  const expectedA = 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
  const expectedB = 1 - expectedA;

  const scoreA = aWon ? 1 : 0;
  const scoreB = aWon ? 0 : 1;

  const newA = Math.round(ratingA + ELO_K_FACTOR * (scoreA - expectedA));
  const newB = Math.round(ratingB + ELO_K_FACTOR * (scoreB - expectedB));

  return [Math.max(100, newA), Math.max(100, newB)];
}

export { DEFAULT_ELO };
