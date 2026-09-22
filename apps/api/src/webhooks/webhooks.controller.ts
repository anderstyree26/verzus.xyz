import { Controller, Post } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('paystack')
  paystack() {
    return this.webhooksService.handlePaystack();
  }

  @Post('moonpay')
  moonpay() {
    return this.webhooksService.handleMoonpay();
  }
}
