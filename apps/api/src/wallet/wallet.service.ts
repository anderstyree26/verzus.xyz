import { Injectable } from '@nestjs/common';
import {
  getWallet,
  type PayoutMethod,
  type WalletService as IWalletService,
  PaysafeClient,
  DEFAULT_PAYSAFE_CONFIG,
} from '@antigravity/core';

@Injectable()
export class WalletService {
  private wallet: IWalletService;
  private paysafe: PaysafeClient;

  constructor() {
    this.wallet = getWallet();
    this.paysafe = new PaysafeClient();
  }

  async getBalance(userId: string) {
    return this.wallet.getBalance(userId);
  }

  async getHistory(userId: string, limit = 50, offset = 0) {
    return this.wallet.history(userId, limit, offset);
  }

  async requestPayout(userId: string, amount: number, method: PayoutMethod) {
    return this.wallet.payout(userId, amount, method);
  }

  /**
   * Deposit funds via Paysafe.
   */
  async deposit(
    userId: string,
    amount: number,
    currency = 'EUR',
    paymentHandleToken?: string,
    method = 'PAYSAFE',
  ) {
    const merchantRefNum = `dep-${userId.slice(0, 8)}-${Date.now()}`;

    // If paymentHandleToken is supplied from Paysafe.js checkout
    let paymentId = `paysafe-sim-${Date.now()}`;

    if (paymentHandleToken) {
      const res = await this.paysafe.processPayment({
        merchantRefNum,
        amount: Math.round(amount * 100), // minor units
        currencyCode: currency,
        paymentHandleToken,
        description: `Verzus ${currency} Deposit via ${method}`,
      });

      if (res.status === 'FAILED') {
        throw new Error(res.error?.message || 'Paysafe payment charge failed');
      }

      paymentId = res.id;
    }

    // Credit user's wallet balance
    const tx = await this.wallet.credit(userId, amount, `Deposit via ${method}`, {
      metadata: {
        paymentId,
        merchantRefNum,
        currency,
        provider: 'PAYSAFE',
      },
    });

    return {
      success: true,
      transactionId: tx.id,
      amount,
      currency,
      paymentId,
      balanceAfter: tx.balanceAfter,
    };
  }

  getPaysafeConfig() {
    return {
      ...this.paysafe.getPublicConfig(),
      supportedCurrencies: ['EUR', 'USD', 'GBP'],
    };
  }
}
