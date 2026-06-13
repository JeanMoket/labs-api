import { Module } from '@nestjs/common';
import { SimpleStorePrismaModule } from './prisma/simple-store-prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { SSOrdersModule } from './orders/orders.module';
import { CheckoutModule } from './checkout/checkout.module';

@Module({
  imports: [
    SimpleStorePrismaModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    SSOrdersModule,
    CheckoutModule,
  ],
})
export class SimpleStoreModule {}
