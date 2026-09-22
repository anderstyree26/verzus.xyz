import { CONFIDENCE } from '../constants';
import { namedLogger } from '../logger';

import type { OCRRead } from './OCRClient';

const log = namedLogger('VotingOCR');

export interface VotingResult {
  text: string;
  confidence: number;
  needsReview: boolean;
  sources: Array<{ engine: string; text: string; confidence: number }>;
}

/**
 * Runs multiple OCR engines in parallel and takes a weighted vote.
 * Weights: local Tesseract (0.5), server fallback (0.5) — tuned for text quality.
 */
export async function runEngines(
  runners: Array<{ name: string; run: () => Promise<OCRRead> }>,
): Promise<VotingResult> {
  const settled = await Promise.allSettled(runners.map((r) => r.run()));

  const sources: VotingResult['sources'] = [];
  settled.forEach((res, i) => {
    const name = runners[i]!.name;
    if (res.status === 'fulfilled') {
      sources.push({ engine: name, text: res.value.text, confidence: res.value.confidence });
    } else {
      log.warn({ engine: name, err: res.reason }, 'OCR engine failed');
    }
  });

  if (sources.length === 0) {
    return { text: '', confidence: 0, needsReview: true, sources: [] };
  }

  if (sources.length === 1) {
    const only = sources[0]!;
    return {
      text: only.text,
      confidence: only.confidence,
      needsReview: only.confidence < CONFIDENCE.AUTO_APPROVE,
      sources,
    };
  }

  // Majority text match.
  const buckets = new Map<string, { count: number; totalConfidence: number }>();
  for (const s of sources) {
    const key = normalize(s.text);
    const b = buckets.get(key) ?? { count: 0, totalConfidence: 0 };
    b.count += 1;
    b.totalConfidence += s.confidence;
    buckets.set(key, b);
  }

  const [winnerKey, winner] = [...buckets.entries()].sort((a, b) => {
    if (b[1].count !== a[1].count) return b[1].count - a[1].count;
    return b[1].totalConfidence - a[1].totalConfidence;
  })[0]!;

  const majorityAgreement = winner.count / sources.length;
  const avgConfidence = winner.totalConfidence / winner.count;
  const confidence = Number((majorityAgreement * avgConfidence).toFixed(4));

  const originalSource = sources.find((s) => normalize(s.text) === winnerKey) ?? sources[0]!;

  return {
    text: originalSource.text,
    confidence,
    needsReview: confidence < CONFIDENCE.AUTO_APPROVE,
    sources,
  };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}
