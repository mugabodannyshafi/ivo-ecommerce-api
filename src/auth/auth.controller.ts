import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LocalGuard } from './guards/local.guard';
import { AuthPayloadDto } from './dto/login.auth.dto';
import { ResetPasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: UserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  @UseGuards(LocalGuard)
  login(@Body() authPayloadDto: AuthPayloadDto) {
    const user = this.authService.validateUser(
      authPayloadDto.email,
      authPayloadDto.password,
    );
    if (!user) throw new HttpException('Invalid credentials', 401);
    return user;
  }

  @Post('refresh')
  async refresh(@Body() body: { userId: string; refreshToken: string }) {
    const { userId, refreshToken } = body;
    const tokens = await this.authService.refreshAccessToken(
      userId,
      refreshToken,
    );
    return tokens;
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
