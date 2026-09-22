import { createHash } from 'node:crypto';

/** SHA-256 of a frame buffer, hex-encoded. */
export function hashFrame(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}
