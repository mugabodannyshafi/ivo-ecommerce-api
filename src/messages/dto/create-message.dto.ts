import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  contact: string;

  @IsEmail()
  email: string;

  @IsString()
  message: string;
}
