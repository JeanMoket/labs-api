import { Body, Controller, Post } from '@nestjs/common';
import { IsString } from 'class-validator';
import { CheckoutService } from './checkout.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';

class CreateSessionDto extends CreateOrderDto {
  @IsString()
  successUrl: string;

  @IsString()
  cancelUrl: string;
}

@Controller('store/checkout')
export class CheckoutController {
  constructor(private readonly service: CheckoutService) {}

  // POST /store/checkout/session
  // Corps : CreateOrderDto + successUrl + cancelUrl
  // Retourne : { checkoutUrl, orderId, orderNumber, accessCode }
  @Post('session')
  createSession(@Body() dto: CreateSessionDto) {
    return this.service.createSession(dto);
  }
}
