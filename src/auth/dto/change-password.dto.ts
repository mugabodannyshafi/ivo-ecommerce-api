import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @MinLength(5)
  @IsNotEmpty()
  @IsString()
  newPassword: string;

  @MinLength(5)
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}
