import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { StripeWebhookController } from './stripe-webhook.controller';
import { SSOrdersModule } from '../orders/orders.module';

@Module({
  imports: [SSOrdersModule],
  controllers: [CheckoutController, StripeWebhookController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
