import { namedLogger } from '../logger';
import { ImagePreprocessor } from '../ocr/ImagePreprocessor';
import { OCRClient } from '../ocr/OCRClient';
import { hashFrame } from '../ocr/FrameHasher';
import type { MatchService } from '../matching/MatchService';
import type { GameProfile } from '../types';

import { TwitchClient } from './TwitchClient';
import { YouTubeClient } from './YouTubeClient';
import { FrameGrabber } from './FrameGrabber';

const log = namedLogger('StreamIngestService');

export interface StreamIngestConfig {
  matchService: MatchService;
  twitchClient?: TwitchClient;
  youtubeClient?: YouTubeClient;
  frameGrabber?: FrameGrabber;
}

export interface LinkedStream {
  matchId: string;
  userId: string;
  platform: 'TWITCH' | 'YOUTUBE';
  channelIdentifier: string;
}

export class StreamIngestService {
  private readonly matchService: MatchService;
  private readonly twitch: TwitchClient;
  private readonly youtube: YouTubeClient;
  private readonly grabber: FrameGrabber;
  private readonly ocrClient: OCRClient;
  private readonly activePollers = new Map<string, NodeJS.Timeout>();

  constructor(config: StreamIngestConfig) {
    this.matchService = config.matchService;
    this.twitch = config.twitchClient ?? new TwitchClient();
    this.youtube = config.youtubeClient ?? new YouTubeClient();
    this.grabber = config.frameGrabber ?? new FrameGrabber();
    this.ocrClient = new OCRClient();
  }

  /**
   * Start polling frames from a linked Twitch/YouTube stream and submit scores.
   */
  async startIngest(stream: LinkedStream, profile: GameProfile): Promise<void> {
    const key = `${stream.matchId}:${stream.userId}`;
    if (this.activePollers.has(key)) return;

    log.info({ stream }, 'starting stream ingest');

    const poller = setInterval(async () => {
      try {
        let streamUrl: string | null = null;
        if (stream.platform === 'TWITCH') {
          streamUrl = await this.twitch.getHlsUrl(stream.channelIdentifier);
        } else if (stream.platform === 'YOUTUBE') {
          streamUrl = await this.youtube.getLiveVideoUrl(stream.channelIdentifier);
        }

        if (!streamUrl) return;

        const rawFrame = await this.grabber.grabFrame(streamUrl);
        const preprocessor = new ImagePreprocessor(profile.roi);
        const processedFrame = await preprocessor.process(rawFrame);
        const frameHash = hashFrame(processedFrame);

        const ocrResult = await this.ocrClient.recognize(processedFrame);
        if (!ocrResult.text) return;

        const isFinal = profile.endKeywords.some((kw) =>
          ocrResult.text.toLowerCase().includes(kw.toLowerCase()),
        );

        await this.matchService.submitScore({
          matchId: stream.matchId,
          playerId: stream.userId,
          rawText: ocrResult.text,
          confidence: ocrResult.confidence,
          isFinal,
          imageHash: frameHash,
          source: 'STREAM_INGEST',
        });

        if (isFinal) {
          // Wait 15s stream latency buffer, then trigger match settlement
          setTimeout(async () => {
            await this.matchService.settle(stream.matchId);
            this.stopIngest(stream.matchId, stream.userId);
          }, 15000);
        }
      } catch (err) {
        log.warn({ err, matchId: stream.matchId }, 'error during stream ingest cycle');
      }
    }, 2000);

    this.activePollers.set(key, poller);
  }

  stopIngest(matchId: string, userId: string): void {
    const key = `${matchId}:${userId}`;
    const timer = this.activePollers.get(key);
    if (timer) {
      clearInterval(timer);
      this.activePollers.delete(key);
      log.info({ matchId, userId }, 'stopped stream ingest');
    }
  }
}
