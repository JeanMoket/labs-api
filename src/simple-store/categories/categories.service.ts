import { Injectable, NotFoundException } from '@nestjs/common';
import { SimpleStorePrismaService } from '../prisma/simple-store-prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly db: SimpleStorePrismaService) {}

  findAll() {
    return this.db.category.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
  }

  async findBySlug(slug: string) {
    const cat = await this.db.category.findUnique({
      where: { slug },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
        products: { where: { isActive: true }, orderBy: { salesCount: 'desc' }, take: 12, include: { formats: true } },
      },
    });
    if (!cat) throw new NotFoundException(`Catégorie "${slug}" introuvable`);
    return cat;
  }
}
