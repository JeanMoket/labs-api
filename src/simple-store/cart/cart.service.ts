import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DiscountType } from '../../generated/simple-store';
import { SimpleStorePrismaService } from '../prisma/simple-store-prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApplyPromoDto } from './dto/apply-promo.dto';

const CART_INCLUDE = {
  items: {
    include: { product: { include: { category: true, formats: true } }, format: true },
    orderBy: { createdAt: 'asc' as const },
  },
};

@Injectable()
export class CartService {
  constructor(private readonly db: SimpleStorePrismaService) {}

  async getOrCreate(sessionId: string) {
    const cart = await this.db.cart.upsert({
      where: { sessionId }, update: {},
      create: { sessionId, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      include: CART_INCLUDE,
    });
    return this.withTotals(cart);
  }

  async addItem(sessionId: string, dto: AddCartItemDto) {
    const cart = await this.getRaw(sessionId);
    const product = await this.db.product.findUnique({ where: { id: dto.productId, isActive: true } });
    if (!product) throw new NotFoundException('Produit introuvable');

    if (dto.formatId) {
      const format = await this.db.productFormat.findUnique({ where: { id: dto.formatId } });
      if (!format || format.productId !== dto.productId)
        throw new BadRequestException('Format invalide pour ce produit');
    }

    const existing = await this.db.cartItem.findFirst({
      where: { cartId: cart.id, productId: dto.productId, formatId: dto.formatId ?? null },
    });

    if (existing) {
      await this.db.cartItem.update({ where: { id: existing.id }, data: { quantity: { increment: dto.quantity ?? 1 } } });
    } else {
      await this.db.cartItem.create({ data: { cartId: cart.id, productId: dto.productId, formatId: dto.formatId, quantity: dto.quantity ?? 1 } });
    }
    return this.getOrCreate(sessionId);
  }

  async updateItem(sessionId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getRaw(sessionId);
    const item = await this.db.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new NotFoundException('Item introuvable dans ce panier');

    if (dto.quantity === 0) {
      await this.db.cartItem.delete({ where: { id: itemId } });
    } else {
      await this.db.cartItem.update({ where: { id: itemId }, data: { quantity: dto.quantity } });
    }
    return this.getOrCreate(sessionId);
  }

  async removeItem(sessionId: string, itemId: string) {
    const cart = await this.getRaw(sessionId);
    await this.db.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
    return this.getOrCreate(sessionId);
  }

  async clear(sessionId: string) {
    const cart = await this.getRaw(sessionId);
    await this.db.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getOrCreate(sessionId);
  }

  async applyPromo(sessionId: string, dto: ApplyPromoDto) {
    const cart = await this.getOrCreate(sessionId);
    const code = dto.code.toUpperCase().trim();
    const promo = await this.db.promoCode.findUnique({ where: { code } });
    if (!promo || !promo.isActive || (promo.expiresAt && promo.expiresAt < new Date()))
      throw new BadRequestException('Code promo invalide ou expiré');

    const subtotal = (cart as any).subtotal;
    if (promo.minOrderAmount && subtotal < promo.minOrderAmount)
      throw new BadRequestException(`Montant minimum requis : ${(promo.minOrderAmount / 100).toFixed(2)} €`);

    const discount = promo.discountType === DiscountType.PERCENT
      ? Math.round((subtotal * promo.discountValue) / 100)
      : promo.discountValue;

    return { ...cart, appliedPromo: { code, discount, promo } };
  }

  private async getRaw(sessionId: string) {
    const cart = await this.db.cart.findUnique({ where: { sessionId } });
    if (!cart) {
      return this.db.cart.create({
        data: { sessionId, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      });
    }
    return cart;
  }

  private withTotals(cart: any) {
    const subtotal = (cart.items ?? []).reduce(
      (acc: number, item: any) => acc + (item.product.price + (item.format?.priceAdjustment ?? 0)) * item.quantity,
      0,
    );
    return { ...cart, subtotal };
  }
}
