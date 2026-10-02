import { createHash } from 'node:crypto';
import sharp from 'sharp';

/** SHA-256 of a frame buffer, hex-encoded. */
export function hashFrame(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Calculates the Hamming distance between two hexadecimal perceptual hash strings.
 * Counts the number of bit positions in which the corresponding bits are different.
 */
export function hammingDistance(hexA: string, hexB: string): number {
  if (!hexA || !hexB) return 64;
  if (hexA.length !== hexB.length) return 64;

  let distance = 0;
  for (let i = 0; i < hexA.length; i++) {
    const a = Number.parseInt(hexA[i]!, 16);
    const b = Number.parseInt(hexB[i]!, 16);
    if (Number.isNaN(a) || Number.isNaN(b)) return 64;
    let xor = a ^ b;
    while (xor > 0) {
      xor &= xor - 1;
      distance++;
    }
  }

  return distance;
}

/**
 * Returns true if two perceptual hashes are visually near-identical.
 * Default threshold: Hamming distance <= 4 (out of 64 bits = ~94%+ visual equivalence).
 */
export function isPerceptualMatch(hashA: string, hashB: string, maxHammingDistance = 4): boolean {
  return hammingDistance(hashA, hashB) <= maxHammingDistance;
}

/**
 * Computes a 64-bit Perceptual Difference Hash (dHash) from raw grayscale pixels.
 * Expects a 9x8 pixel matrix (9 columns, 8 rows = 72 bytes).
 */
export function computeDHashFromGrayscale(pixels: Uint8Array): string {
  let high32 = 0;
  let low32 = 0;
  let bitIndex = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const idx = row * 9 + col;
      const leftPixel = pixels[idx] ?? 0;
      const rightPixel = pixels[idx + 1] ?? 0;
      const bit = leftPixel < rightPixel ? 1 : 0;

      if (bitIndex < 32) {
        high32 = (high32 << 1) | bit;
      } else {
        low32 = (low32 << 1) | bit;
      }
      bitIndex++;
    }
  }

  const highHex = (high32 >>> 0).toString(16).padStart(8, '0');
  const lowHex = (low32 >>> 0).toString(16).padStart(8, '0');
  return highHex + lowHex;
}

/**
 * Computes a 64-bit Perceptual Difference Hash (dHash) from any image Buffer.
 * Resizes the image to 9x8, converts to grayscale, and compares horizontal gradient transitions.
 * Highly resilient to video compression artifacts, H.264 macroblock noise, and subtle lighting variations.
 */
export async function computeDHash(buffer: Buffer): Promise<string> {
  const rawGrayscale = await sharp(buffer)
    .resize(9, 8, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer();

  return computeDHashFromGrayscale(rawGrayscale);
}
