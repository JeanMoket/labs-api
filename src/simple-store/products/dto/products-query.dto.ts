import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ProductsQueryDto {
  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  minPrice?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  maxPrice?: number;

  @IsOptional() @IsIn(['FORMATION', 'BOOK', 'GUIDE', 'BUNDLE', 'TEMPLATE'])
  type?: string;

  @IsOptional() @IsIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'])
  level?: string;

  @IsOptional() @IsIn(['newest', 'price_asc', 'price_desc', 'popular', 'rating', 'bestseller'])
  sort?: string = 'newest';

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  limit?: number = 12;

  @IsOptional() @Transform(({ value }) => value === 'true' || value === true) @IsBoolean()
  featured?: boolean;

  @IsOptional() @Transform(({ value }) => value === 'true' || value === true) @IsBoolean()
  bestseller?: boolean;

  @IsOptional() @IsString()
  exclude?: string;
}
