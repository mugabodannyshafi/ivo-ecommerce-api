import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @MinLength(5)
  @IsNotEmpty()
  @IsString()
  password: string;

  @MinLength(5)
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}
