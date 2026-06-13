import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('store/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) { return this.ordersService.createFromCart(dto); }

  @Get('track/:accessCode')
  track(@Param('accessCode') accessCode: string) { return this.ordersService.trackByCode(accessCode); }
}
