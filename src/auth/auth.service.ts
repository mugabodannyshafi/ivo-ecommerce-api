import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../typeorm/entities/User';
import { LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ResetPasswordDto } from './dto/change-password.dto';
// import { Queue } from 'bullmq';
// import { InjectQueue } from '@nestjs/bull';
import { ShoppingCart as Cart } from '../typeorm/entities/Cart';
import { Wishlist } from '../typeorm/entities/Wishlist';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    // @InjectQueue('mailQueue') private readonly mailQueue: Queue,
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @Inject() private readonly mailService: MailService,
  ) {}

  async create(createAuthDto: UserDto) {
    const { email } = createAuthDto;
    const duplicateUser = await this.userRepository.findOneBy({ email });
    if (duplicateUser)
      throw new BadRequestException({
        message: 'User already exists',
      });
    if (createAuthDto.confirmPassword !== createAuthDto.password)
      throw new BadRequestException('passwords should be matched');
    const { confirmPassword, phoneNumber, ...userData } = createAuthDto;
    const finalUserData = { ...userData, phoneNumber: phoneNumber.toString() };
    const hashedPassword = await bcrypt.hash(finalUserData.password, 10);
    const newUser = this.userRepository.create({
      ...finalUserData,
      password: hashedPassword,
    });

    const result = await this.userRepository.save(newUser);
    const newCart = this.cartRepository.create({ user: result });
    await this.cartRepository.save(newCart);
    const newWishlist = this.wishlistRepository.create({ user: result });
    await this.wishlistRepository.save(newWishlist);
    return {
      message: 'user Created Successful',
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { userId: user.userId, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.save(user);
    return {
      userId: user.userId,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async refreshAccessToken(userId: string, refreshToken: string) {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const refreshTokenMatch = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = { userId: user.userId, role: user.role };
    const newAccessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

    return {
      accessToken: newAccessToken,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (user === null) throw new NotFoundException('User Not Found');
    if (user) {
      const resetToken = Math.floor(10000 + Math.random() * 90000).toString();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await this.userRepository.update(
        { email },
        {
          resetPasswordToken: resetToken,
          resetPasswordExpires: otpExpiresAt,
        },
      );

      await this.mailService.sendPasswordResetEmail(
        email,
        resetToken,
        user.lastName,
      );

    }
    return { message: 'Check your email address' };
  }

  async resetPassword(resetToken: string, resetPasswordDto: ResetPasswordDto) {
    const { password, confirmPassword } = resetPasswordDto;
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords must be equal');
    }

    const token = await this.userRepository.findOne({
      where: { resetPasswordToken: resetToken },
    });

    if (!token) {
      throw new UnauthorizedException('Incorrect token');
    }
    if (token.resetPasswordExpires < new Date()) {
      throw new BadRequestException(
        'Token has expired. Please request a new one.',
      );
    }

    token.resetPasswordToken = null;
    token.resetPasswordExpires = null;
    await this.userRepository.save(token);

    const user = await this.userRepository.findOneBy({ userId: token.userId });
    if (user) {
      user.password = await bcrypt.hash(password, 10);
      await this.userRepository.save(user);

      return { message: 'Password changed successfully' };
    }

    throw new BadRequestException('User not found');
  }

  async logout(userId: string) {
    const user = await this.userRepository.findOne({ where: { userId } });
    user.refreshToken = null;
    await this.userRepository.save(user);
  }

  async verifyPassword(resetToken: string) {
    if (!resetToken) {
      throw new BadRequestException('Token is required');
    }

    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: MoreThanOrEqual(new Date()),
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Password reset token is invalid or has expired',
      );
    }

    return { token: user.resetPasswordToken };
  }
}
