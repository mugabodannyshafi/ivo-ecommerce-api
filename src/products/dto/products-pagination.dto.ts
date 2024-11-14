import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class ProductsByCategoryDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsPositive()
  page: number = 1;

  @IsOptional()
  @IsPositive()
  perPage: number = 100;
}
