import { describe, it, expect } from 'vitest';
import { StubRealWallet } from '../src/wallet/StubRealWallet';
import { WalletError } from '../src/errors';

describe('Wallet Abstraction', () => {
  it('StubRealWallet throws NOT_IMPLEMENTED for all operations', async () => {
    const stub = new StubRealWallet();

    await expect(stub.getBalance('user1')).rejects.toThrowError(WalletError);
    await expect(stub.credit('user1', 100, 'test')).rejects.toThrowError(WalletError);
    await expect(stub.debit('user1', 50, 'test')).rejects.toThrowError(WalletError);
    await expect(stub.lock('user1', 10, { matchId: 'm1' })).rejects.toThrowError(WalletError);
    await expect(stub.settle('m1', 'user1')).rejects.toThrowError(WalletError);
    await expect(stub.refund('m1')).rejects.toThrowError(WalletError);
    await expect(stub.payout('user1', 100, { type: 'DEMO' })).rejects.toThrowError(WalletError);
  });
});
