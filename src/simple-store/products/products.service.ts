import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/simple-store';
import { SimpleStorePrismaService } from '../prisma/simple-store-prisma.service';
import { ProductsQueryDto } from './dto/products-query.dto';

const PRODUCT_INCLUDE = {
  category: true,
  formats: { orderBy: { createdAt: 'asc' as const } },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(private readonly db: SimpleStorePrismaService) {}

  async findAll(query: ProductsQueryDto) {
    const { category, search, minPrice, maxPrice, type, level, sort = 'newest', page = 1, limit = 12, featured, bestseller, exclude } = query;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(exclude    && { id:           { not: exclude } }),
      ...(featured   && { isFeatured:   true }),
      ...(bestseller && { isBestseller: true }),
      ...(type       && { type:         type as any }),
      ...(level      && { level:        level as any }),
      ...(category   && { category:     { slug: category } }),
      ...(search     && { OR: [
        { name:        { contains: search, mode: 'insensitive' } },
        { shortDesc:   { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { author:      { contains: search, mode: 'insensitive' } },
      ]}),
      ...((minPrice !== undefined || maxPrice !== undefined) && { price: {
        ...(minPrice !== undefined && { gte: minPrice * 100 }),
        ...(maxPrice !== undefined && { lte: maxPrice * 100 }),
      }}),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === 'price_asc'  ? { price: 'asc' } :
      sort === 'price_desc' ? { price: 'desc' } :
      sort === 'popular'    ? { salesCount: 'desc' } :
      sort === 'rating'     ? { rating: 'desc' } :
      sort === 'bestseller' ? { salesCount: 'desc' } :
                              { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      this.db.product.findMany({ where, orderBy, take: limit, skip: (page - 1) * limit, include: PRODUCT_INCLUDE }),
      this.db.product.count({ where }),
    ]);
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const product = await this.db.product.findUnique({
      where: { id, isActive: true },
      include: { ...PRODUCT_INCLUDE, reviews: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.db.product.findUnique({
      where: { slug, isActive: true },
      include: { ...PRODUCT_INCLUDE, reviews: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    if (!product) throw new NotFoundException(`Produit "${slug}" introuvable`);
    return product;
  }

  async getReviews(productId: string) {
    return this.db.review.findMany({ where: { productId }, orderBy: { createdAt: 'desc' } });
  }
}
