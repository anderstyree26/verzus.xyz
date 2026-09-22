import { namedLogger } from '../logger';

const log = namedLogger('TwitchClient');

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

interface StreamsResponse {
  data: Array<{ id: string; user_login: string; type: string; title: string }>;
}

/** Minimal Twitch Helix client for finding live HLS streams. */
export class TwitchClient {
  private token: string | null = null;
  private tokenExpiresAt = 0;

  constructor(
    private readonly clientId = process.env.TWITCH_CLIENT_ID ?? '',
    private readonly clientSecret = process.env.TWITCH_CLIENT_SECRET ?? '',
  ) {}

  async getAccessToken(): Promise<string | null> {
    if (this.token && Date.now() < this.tokenExpiresAt - 60_000) return this.token;
    if (!this.clientId || !this.clientSecret) {
      log.warn('Twitch credentials missing');
      return null;
    }

    const res = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!res.ok) return null;
    const json = (await res.json()) as TokenResponse;
    this.token = json.access_token;
    this.tokenExpiresAt = Date.now() + json.expires_in * 1000;
    return this.token;
  }

  /** Returns an HLS URL if the channel is live, otherwise null. */
  async getHlsUrl(channelLogin: string): Promise<string | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    const res = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(channelLogin)}`,
      { headers: { 'Client-Id': this.clientId, Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) return null;

    const json = (await res.json()) as StreamsResponse;
    if (!json.data || json.data.length === 0) return null;

    return `https://twitch.tv/${channelLogin}`;
  }
}
