import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString() @IsNotEmpty() cartSessionId: string;
  @IsEmail() customerEmail: string;
  @IsString() @IsNotEmpty() customerFirstName: string;
  @IsString() @IsNotEmpty() customerLastName: string;
  @IsOptional() @IsString() customerPhone?: string;
  @IsOptional() @IsBoolean() hasPhysicalItems?: boolean;
  @IsOptional() @IsString() shippingLine1?: string;
  @IsOptional() @IsString() shippingLine2?: string;
  @IsOptional() @IsString() shippingCity?: string;
  @IsOptional() @IsString() shippingZip?: string;
  @IsOptional() @IsString() shippingCountry?: string;
  @IsOptional() @IsIn(['standard', 'express', 'pickup']) shippingMethod?: string;
  @IsOptional() @IsString() promoCode?: string;
}
