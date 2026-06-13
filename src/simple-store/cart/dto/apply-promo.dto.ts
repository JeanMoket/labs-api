import { IsNotEmpty, IsString } from 'class-validator';

export class ApplyPromoDto {
  @IsString() @IsNotEmpty()
  code: string;
}
