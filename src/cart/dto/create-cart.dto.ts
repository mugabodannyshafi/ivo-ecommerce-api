import { IsNotEmpty, IsNumber, isString, IsString } from 'class-validator';

export class CreateCartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  size: string;

  @IsString()
  color: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
