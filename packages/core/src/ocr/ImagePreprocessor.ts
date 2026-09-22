import sharp from 'sharp';

import type { ROI } from '../types';

/**
 * Turns a raw screenshot buffer into a clean, OCR-friendly buffer.
 * All operations are synchronous-safe via sharp's promise API.
 */
export class ImagePreprocessor {
  constructor(private readonly roi: ROI) {}

  async process(buffer: Buffer): Promise<Buffer> {
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) throw new Error('Image has no dimensions');

    const left = Math.max(0, Math.round(this.roi.x * meta.width));
    const top = Math.max(0, Math.round(this.roi.y * meta.height));
    const width = Math.max(1, Math.round(this.roi.w * meta.width));
    const height = Math.max(1, Math.round(this.roi.h * meta.height));

    return sharp(buffer)
      .extract({ left, top, width, height })
      .grayscale()
      .median(3)
      .normalize()
      .sharpen({ sigma: 1 })
      .resize({ width: width * 2, kernel: 'lanczos3' })
      .threshold(128)
      .png()
      .toBuffer();
  }
}
