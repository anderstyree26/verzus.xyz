export interface GeoblockResult {
  allowed: boolean;
  reason?: string;
}

/**
 * List of ISO country codes where real-money skill gaming or specific operations are restricted.
 */
const SANCTIONED_OR_BLOCKED_REGIONS = new Set(['KP', 'IR', 'SY', 'CU']);

export function checkGeoblock(region: string | null | undefined): GeoblockResult {
  if (!region) {
    return { allowed: true };
  }

  const normalized = region.trim().toUpperCase();
  if (SANCTIONED_OR_BLOCKED_REGIONS.has(normalized)) {
    return {
      allowed: false,
      reason: `Region ${normalized} is restricted from participation under regulatory compliance.`,
    };
  }

  return { allowed: true };
}
