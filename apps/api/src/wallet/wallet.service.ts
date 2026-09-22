import { Injectable } from '@nestjs/common';
import { getWallet, type PayoutMethod, type WalletService as IWalletService } from '@antigravity/core';

@Injectable()
export class WalletService {
  private wallet: IWalletService;

  constructor() {
    this.wallet = getWallet();
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
}
