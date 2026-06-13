import * as common from '@nestjs/common';
import {Request} from 'express';
import {CheckoutService} from './checkout.service';

@common.Controller('store/checkout')
export class StripeWebhookController {
  constructor(private readonly service: CheckoutService) {
  }

  // POST /store/checkout/webhook
  // Corps raw (Express raw body middleware requis — configuré dans main.ts)
  @common.Post('webhook')
  handleWebhook(
      @common.Req() req: common.RawBodyRequest<Request>,
      @common.Headers('stripe-signature') signature: string,
  ) {
    return this.service.handleWebhook(req.rawBody!, signature);
  }
}
