/**
 * Unified Currency Formatting Utility for VerzusXYZ
 * All platform cash entry fees, prize pools, and withdrawals are standardized in Euros (€ / EUR).
 */

export function formatEUR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '€0.00';
  }
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace(/\s+/g, ' '); // Standardize non-breaking space
}

export function formatPoints(points: number | null | undefined): string {
  if (!points || isNaN(points)) return '0 PTS';
  return `${new Intl.NumberFormat('en-US').format(Math.floor(points))} PTS`;
}

export function formatPrize(
  cashEur?: number | null,
  points?: number | null,
): { primary: string; secondary?: string } {
  if (cashEur && cashEur > 0) {
    return {
      primary: formatEUR(cashEur),
      secondary: points && points > 0 ? `+ ${formatPoints(points)}` : undefined,
    };
  }
  if (points && points > 0) {
    return {
      primary: formatPoints(points),
    };
  }
  return {
    primary: 'Free / Glory',
  };
}
