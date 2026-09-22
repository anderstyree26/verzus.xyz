import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class WebhooksService {
  handlePaystack() {
    throw new HttpException(
      'Paystack webhook integration requires WALLET_MODE=real. Stubbed in demo mode.',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  handleMoonpay() {
    throw new HttpException(
      'Moonpay webhook integration requires WALLET_MODE=real. Stubbed in demo mode.',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
