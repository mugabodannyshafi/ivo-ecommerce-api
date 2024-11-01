import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  stockQuantity: number;

  @IsOptional()
  @IsNumber()
  discount: number;

  @IsArray()
  @IsString({ each: true })
  size: string[];

  @IsArray()
  @IsString({ each: true })
  colors: string[];

  @IsArray()
  @IsString({ each: true })
  imageURL: string[];

  @IsNotEmpty()
  @IsString()
  categoryId: string;
}
