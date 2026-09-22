import { namedLogger } from '../logger';

import type { OCRRead } from './OCRClient';

const log = namedLogger('OCRServer');

/**
 * Server-side OCR fallback using Optiic free tier.
 * Only invoked when client OCR confidence is low.
 */
export class OCRServer {
  private readonly apiKey: string | undefined;

  constructor(apiKey = process.env.OPTIIC_API_KEY) {
    this.apiKey = apiKey;
  }

  async recognize(image: Buffer): Promise<OCRRead> {
    if (!this.apiKey) {
      log.warn('OPTIIC_API_KEY missing — server OCR disabled');
      return { text: '', confidence: 0 };
    }

    const form = new FormData();
    form.append('apiKey', this.apiKey);
    form.append('image', new Blob([new Uint8Array(image)]), 'frame.png');

    const res = await fetch('https://api.optiic.dev/recognize', {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      log.warn({ status: res.status }, 'Optiic request failed');
      return { text: '', confidence: 0 };
    }

    const json = (await res.json()) as { text?: string; confidence?: number };
    return { text: json.text ?? '', confidence: json.confidence ?? 0.7 };
  }
}
