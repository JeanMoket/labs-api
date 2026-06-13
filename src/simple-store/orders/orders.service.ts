import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DiscountType } from '../../generated/simple-store';
import { SimpleStorePrismaService } from '../prisma/simple-store-prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

const SHIPPING_FEES: Record<string, number> = { standard: 490, express: 990, pickup: 0 };

@Injectable()
export class OrdersService {
  constructor(private readonly db: SimpleStorePrismaService) {}

  async createFromCart(dto: CreateOrderDto) {
    const cart = await this.db.cart.findUnique({
      where: { sessionId: dto.cartSessionId },
      include: { items: { include: { product: true, format: true } } },
    });
    if (!cart || cart.items.length === 0) throw new BadRequestException('Le panier est vide ou introuvable');

    const subtotal = cart.items.reduce((acc, item) => acc + (item.product.price + (item.format?.priceAdjustment ?? 0)) * item.quantity, 0);

    let discountAmount = 0, promoCodeId: string | undefined, promoCodeSnapshot: string | undefined;
    if (dto.promoCode) {
      const promo = await this.db.promoCode.findUnique({ where: { code: dto.promoCode.toUpperCase().trim() } });
      if (!promo || !promo.isActive || (promo.expiresAt && promo.expiresAt < new Date()))
        throw new BadRequestException('Code promo invalide ou expiré');
      if (promo.minOrderAmount && subtotal < promo.minOrderAmount)
        throw new BadRequestException(`Montant minimum requis : ${(promo.minOrderAmount / 100).toFixed(2)} €`);
      discountAmount = promo.discountType === DiscountType.PERCENT
        ? Math.round((subtotal * promo.discountValue) / 100) : promo.discountValue;
      promoCodeId = promo.id; promoCodeSnapshot = promo.code;
    }

    const hasPhysical = dto.hasPhysicalItems ?? cart.items.some((i) => !i.product.isDigital);
    const shippingAmount = hasPhysical ? (SHIPPING_FEES[dto.shippingMethod ?? 'standard'] ?? 490) : 0;
    const total = subtotal - discountAmount + shippingAmount;
    const orderNumber = await this.generateOrderNumber();
    const accessCode = this.generateAccessCode();

    const order = await this.db.order.create({
      data: {
        orderNumber, accessCode,
        customerEmail: dto.customerEmail, customerFirstName: dto.customerFirstName,
        customerLastName: dto.customerLastName, customerPhone: dto.customerPhone,
        hasPhysicalItems: hasPhysical,
        shippingLine1: dto.shippingLine1, shippingLine2: dto.shippingLine2,
        shippingCity: dto.shippingCity, shippingZip: dto.shippingZip,
        shippingCountry: dto.shippingCountry, shippingMethod: dto.shippingMethod,
        subtotal, discountAmount, shippingAmount, total,
        promoCodeId, promoCodeSnapshot,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId, productName: item.product.name, productImage: item.product.imageUrl,
            formatLabel: item.format?.label, isDigital: item.product.isDigital,
            unitPrice: item.product.price + (item.format?.priceAdjustment ?? 0),
            quantity: item.quantity,
            totalPrice: (item.product.price + (item.format?.priceAdjustment ?? 0)) * item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    if (promoCodeId) await this.db.promoCode.update({ where: { id: promoCodeId }, data: { usedCount: { increment: 1 } } });
    await this.db.cartItem.deleteMany({ where: { cartId: cart.id } });
    return order;
  }

  async trackByCode(accessCode: string) {
    const order = await this.db.order.findUnique({
      where: { accessCode },
      include: { items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } } },
    });
    if (!order) throw new NotFoundException('Commande introuvable');
    return order;
  }

  private async generateOrderNumber() {
    const year = new Date().getFullYear();
    const count = await this.db.order.count();
    return `SS-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  private generateAccessCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
}
