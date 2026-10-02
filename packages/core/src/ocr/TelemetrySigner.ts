import * as crypto from 'crypto';

export interface TelemetryPayload {
  matchId: string;
  playerId: string;
  seq: number;
  timestamp: number;
  perceptualHash?: string | null;
  rawText?: string;
  data?: Record<string, unknown>;
}

export interface TelemetryVerificationResult {
  valid: boolean;
  reason?: string;
}

export interface TelemetryVerificationOptions {
  /** Maximum allowable clock skew in milliseconds between client and server. Default: 15,000ms. */
  maxSkewMs?: number;
}

/**
 * Creates a deterministic canonical representation of the telemetry payload for signing.
 */
export function canonicalizeTelemetryPayload(payload: TelemetryPayload): string {
  const parts = [
    payload.matchId,
    payload.playerId,
    payload.seq.toString(),
    payload.timestamp.toString(),
    payload.perceptualHash || '',
    payload.rawText || '',
    payload.data ? JSON.stringify(payload.data, Object.keys(payload.data).sort()) : '',
  ];
  return parts.join('|');
}

/**
 * Generates a cryptographically strong session secret for a match room or player session.
 */
export function generateSessionSecret(byteLength: number = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * Signs a telemetry payload using HMAC-SHA256 with the match session secret.
 */
export function signTelemetry(secret: string, payload: TelemetryPayload): string {
  const canonical = canonicalizeTelemetryPayload(payload);
  return crypto.createHmac('sha256', secret).update(canonical).digest('hex');
}

/**
 * Authoritatively verifies a client telemetry packet against the session secret,
 * enforcing monotonic sequence numbers, timestamp freshness, and HMAC integrity.
 */
export function verifyTelemetry(
  secret: string,
  signature: string,
  payload: TelemetryPayload,
  lastSeq?: number,
  options: TelemetryVerificationOptions = {}
): TelemetryVerificationResult {
  const maxSkewMs = options.maxSkewMs ?? 15_000;

  // 1. Monotonic sequence check
  if (lastSeq !== undefined && payload.seq <= lastSeq) {
    return {
      valid: false,
      reason: `Sequence regression detected: expected seq > ${lastSeq}, received ${payload.seq}`,
    };
  }

  // 2. Timestamp freshness check
  const now = Date.now();
  const skew = Math.abs(now - payload.timestamp);
  if (skew > maxSkewMs) {
    return {
      valid: false,
      reason: `Timestamp skew of ${skew}ms exceeds maximum allowed threshold of ${maxSkewMs}ms`,
    };
  }

  // 3. HMAC-SHA256 signature verification
  const expectedSignature = signTelemetry(secret, payload);
  try {
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSignature, 'hex');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return {
        valid: false,
        reason: 'Invalid telemetry signature: payload does not match HMAC-SHA256 digest',
      };
    }
  } catch {
    return {
      valid: false,
      reason: 'Malformed telemetry signature format',
    };
  }

  return { valid: true };
}
