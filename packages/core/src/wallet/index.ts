import { createServiceClient } from '@antigravity/db';

import { DemoWallet } from './DemoWallet';
import { StubRealWallet } from './StubRealWallet';

import type { WalletService } from './WalletService';

export * from './WalletService';
export { DemoWallet } from './DemoWallet';
export { StubRealWallet } from './StubRealWallet';

let cached: WalletService | null = null;

/**
 * Returns the process-wide wallet singleton.
 * WALLET_MODE=real switches to the stub until a real provider is wired in.
 */
export function getWallet(): WalletService {
  if (cached) return cached;

  const mode = process.env.WALLET_MODE ?? 'demo';

  if (mode === 'real') {
    cached = new StubRealWallet();
    return cached;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for DemoWallet');
  }

  const client = createServiceClient(url, key);
  cached = new DemoWallet({ client });
  return cached;
}
