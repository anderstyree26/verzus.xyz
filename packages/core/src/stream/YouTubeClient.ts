import { namedLogger } from '../logger';

const log = namedLogger('YouTubeClient');

interface SearchItem {
  id?: { videoId?: string };
  snippet?: { liveBroadcastContent?: string };
}

interface SearchResponse {
  items?: SearchItem[];
}

/** Minimal YouTube Data API client to locate a live stream URL. */
export class YouTubeClient {
  constructor(private readonly apiKey = process.env.YOUTUBE_API_KEY ?? '') {}

  async getLiveVideoUrl(channelId: string): Promise<string | null> {
    if (!this.apiKey) {
      log.warn('YouTube API key missing');
      return null;
    }

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(
        channelId,
      )}&eventType=live&type=video&key=${this.apiKey}`,
    );

    if (!res.ok) {
      log.warn({ status: res.status }, 'YouTube API request failed');
      return null;
    }

    const json = (await res.json()) as SearchResponse;
    const item = json.items?.[0];
    if (!item?.id?.videoId) return null;

    return `https://www.youtube.com/watch?v=${item.id.videoId}`;
  }
}
