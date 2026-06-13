import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { OrderStatus } from '../../generated/simple-store';
import { SimpleStorePrismaService } from '../prisma/simple-store-prisma.service';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';

@Injectable()
export class CheckoutService {
  private stripe: Stripe;

  constructor(
    private readonly db: SimpleStorePrismaService,
    private readonly ordersService: OrdersService,
  ) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY manquant dans .env');
    this.stripe = new Stripe(key);
  }

  // ── Créer une session Stripe + commande en même temps ────────────────────

  async createSession(dto: CreateOrderDto & { successUrl: string; cancelUrl: string }) {
    // 1. Créer la commande (PENDING)
    const order = await this.ordersService.createFromCart(dto);

    // 2. Construire les line items pour Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: 'eur',
        unit_amount: item.unitPrice,
        product_data: {
          name: item.formatLabel
            ? `${item.productName} — ${item.formatLabel}`
            : item.productName,
          ...(item.productImage && { images: [item.productImage] }),
        },
      },
    }));

    // Frais de livraison
    if (order.shippingAmount > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: order.shippingAmount,
          product_data: { name: 'Livraison' },
        },
      });
    }

    // Remise via coupon Stripe si promo appliquée
    let discounts: Stripe.Checkout.SessionCreateParams['discounts'];
    if (order.discountAmount > 0) {
      const coupon = await this.stripe.coupons.create({
        amount_off: order.discountAmount,
        currency: 'eur',
        name: order.promoCodeSnapshot ?? 'Réduction',
        duration: 'once',
      });
      discounts = [{ coupon: coupon.id }];
    }

    // 3. Créer la session Stripe
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      ...(discounts && { discounts }),
      customer_email: order.customerEmail,
      success_url: `${dto.successUrl}?order=${order.accessCode}`,
      cancel_url: dto.cancelUrl,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      payment_intent_data: { metadata: { orderId: order.id } },
    });

    // 4. Sauvegarder l'ID de session sur la commande
    await this.db.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    return {
      checkoutUrl: session.url,
      orderId: order.id,
      orderNumber: order.orderNumber,
      accessCode: order.accessCode,
    };
  }

  // ── Traiter le webhook Stripe ─────────────────────────────────────────────

  async handleWebhook(rawBody: Buffer, signature: string) {
    const secret = process.env.SIMPLE_STORE_STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error('SIMPLE_STORE_STRIPE_WEBHOOK_SECRET manquant');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      throw new BadRequestException('Signature webhook invalide');
    }

    // Déduplication
    const already = await this.db.stripeWebhookEvent.findUnique({ where: { id: event.id } });
    if (already) return { received: true };
    await this.db.stripeWebhookEvent.create({ data: { id: event.id } });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === 'paid') {
          await this.markPaid(session.metadata?.orderId, session.payment_intent as string);
        }
        break;
      }
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        if (pi.metadata?.orderId) {
          await this.markPaid(pi.metadata.orderId, pi.id);
        }
        break;
      }
    }

    return { received: true };
  }

  private async markPaid(orderId: string | null | undefined, paymentIntentId: string) {
    if (!orderId) return;
    const order = await this.db.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== OrderStatus.PENDING) return;

    await this.db.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAID,
        stripePaymentIntentId: paymentIntentId,
        paidAt: new Date(),
      },
    });
  }
}
