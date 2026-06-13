import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsQueryDto } from './dto/products-query.dto';

@Controller('store/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ProductsQueryDto) { return this.productsService.findAll(query); }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) { return this.productsService.findBySlug(slug); }

  @Get(':id')
  findById(@Param('id') id: string) { return this.productsService.findById(id); }

  @Get(':id/reviews')
  getReviews(@Param('id') id: string) { return this.productsService.getReviews(id); }
}
