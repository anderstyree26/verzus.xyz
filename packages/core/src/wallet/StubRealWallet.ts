import { WalletError } from '../errors';

import type {
  CreditOptions,
  Lock,
  LockContext,
  PayoutMethod,
  PayoutResult,
  Transaction,
  WalletService,
  WalletSnapshot,
} from './WalletService';

const notImplemented = async (method: string): Promise<never> => {
  throw new WalletError(
    'NOT_IMPLEMENTED',
    `Real wallet method ${method} is not yet implemented. Set WALLET_MODE=demo or add an integration.`,
  );
};

/** Placeholder used when WALLET_MODE=real until a real provider is wired in. */
export class StubRealWallet implements WalletService {
  getBalance(_userId: string): Promise<WalletSnapshot> {
    return notImplemented('getBalance');
  }
  credit(_userId: string, _amount: number, _reason: string, _opts?: CreditOptions): Promise<Transaction> {
    return notImplemented('credit');
  }
  debit(_userId: string, _amount: number, _reason: string, _opts?: CreditOptions): Promise<Transaction> {
    return notImplemented('debit');
  }
  lock(_userId: string, _amount: number, _ctx: LockContext): Promise<Lock> {
    return notImplemented('lock');
  }
  settle(_matchId: string, _winnerId: string, _amount?: number): Promise<void> {
    return notImplemented('settle');
  }
  refund(_matchId: string): Promise<void> {
    return notImplemented('refund');
  }
  refundTournament(_tournamentId: string): Promise<void> {
    return notImplemented('refundTournament');
  }
  payout(_userId: string, _amount: number, _method: PayoutMethod): Promise<PayoutResult> {
    return notImplemented('payout');
  }
  history(_userId: string, _limit?: number, _offset?: number): Promise<Transaction[]> {
    return notImplemented('history');
  }
}
