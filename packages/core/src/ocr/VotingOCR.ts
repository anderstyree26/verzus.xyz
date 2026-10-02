import { CONFIDENCE } from '../constants';
import { namedLogger } from '../logger';

import type { OCRRead } from './OCRClient';

const log = namedLogger('VotingOCR');

export interface VotingResult {
  text: string;
  confidence: number;
  needsReview: boolean;
  consecutiveStableFrames?: number;
  sources: Array<{ engine: string; text: string; confidence: number }>;
}

export interface RunEnginesOptions {
  recentHistory?: Array<{ text?: string; rawText?: string }>;
}

/**
 * Calculates temporal persistence confidence multiplier.
 * If OCR reads the exact same result across N consecutive recent frames,
 * confidence is boosted: EffectiveConfidence = BaseConfidence * (1 + 0.1 * consecutiveStableFrames).
 * Capped at 1.0.
 */
export function computeTemporalConfidence(
  currentText: string,
  baseConfidence: number,
  recentHistory: Array<{ text?: string; rawText?: string }> = [],
): { effectiveConfidence: number; consecutiveStableFrames: number } {
  if (!currentText || recentHistory.length === 0) {
    return { effectiveConfidence: baseConfidence, consecutiveStableFrames: 0 };
  }

  const normCurrent = normalize(currentText);
  let consecutiveStableFrames = 0;

  for (let i = recentHistory.length - 1; i >= 0; i--) {
    const prevText = recentHistory[i]?.text ?? recentHistory[i]?.rawText ?? '';
    if (normalize(prevText) === normCurrent) {
      consecutiveStableFrames++;
    } else {
      break;
    }
  }

  // Multiplier: +10% per consecutive frame, max 30% boost (3 frames)
  const multiplier = 1 + 0.1 * Math.min(3, consecutiveStableFrames);
  const effectiveConfidence = Number(Math.min(1.0, baseConfidence * multiplier).toFixed(4));

  return { effectiveConfidence, consecutiveStableFrames };
}

/**
 * Runs multiple OCR engines in parallel and takes a weighted vote.
 * Enhances confidence with temporal persistence across consecutive sampling windows.
 */
export async function runEngines(
  runners: Array<{ name: string; run: () => Promise<OCRRead> }>,
  opts?: RunEnginesOptions,
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
    const { effectiveConfidence, consecutiveStableFrames } = computeTemporalConfidence(
      only.text,
      only.confidence,
      opts?.recentHistory,
    );
    return {
      text: only.text,
      confidence: effectiveConfidence,
      consecutiveStableFrames,
      needsReview: effectiveConfidence < CONFIDENCE.AUTO_APPROVE,
      sources,
    };
  }

  // Majority text match
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
  const baseConfidence = Number((majorityAgreement * avgConfidence).toFixed(4));

  const originalSource = sources.find((s) => normalize(s.text) === winnerKey) ?? sources[0]!;

  const { effectiveConfidence, consecutiveStableFrames } = computeTemporalConfidence(
    originalSource.text,
    baseConfidence,
    opts?.recentHistory,
  );

  return {
    text: originalSource.text,
    confidence: effectiveConfidence,
    consecutiveStableFrames,
    needsReview: effectiveConfidence < CONFIDENCE.AUTO_APPROVE,
    sources,
  };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}
