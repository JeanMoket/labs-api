import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApplyPromoDto } from './dto/apply-promo.dto';

@Controller('store/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':sessionId') getCart(@Param('sessionId') sid: string) { return this.cartService.getOrCreate(sid); }
  @Post(':sessionId/items') addItem(@Param('sessionId') sid: string, @Body() dto: AddCartItemDto) { return this.cartService.addItem(sid, dto); }
  @Patch(':sessionId/items/:itemId') updateItem(@Param('sessionId') sid: string, @Param('itemId') iid: string, @Body() dto: UpdateCartItemDto) { return this.cartService.updateItem(sid, iid, dto); }
  @Delete(':sessionId/items/:itemId') removeItem(@Param('sessionId') sid: string, @Param('itemId') iid: string) { return this.cartService.removeItem(sid, iid); }
  @Delete(':sessionId') clearCart(@Param('sessionId') sid: string) { return this.cartService.clear(sid); }
  @Post(':sessionId/promo') applyPromo(@Param('sessionId') sid: string, @Body() dto: ApplyPromoDto) { return this.cartService.applyPromo(sid, dto); }
}
