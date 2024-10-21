import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';
import { LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthPayloadDto } from './dto/login.auth.dto';
import { ResetPasswordDto } from './dto/change-password.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bull';
import { ShoppingCart as Cart } from 'src/typeorm/entities/Cart';
import { Wishlist } from 'src/typeorm/entities/Wishlist';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectQueue('mailQueue') private readonly mailQueue: Queue,
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
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
    return result;
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

    // Validate the provided refresh token with the stored hashed token
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

      const result = await this.userRepository.update(
        { email },
        {
          resetPasswordToken: resetToken,
          resetPasswordExpires: otpExpiresAt,
        },
      );

      await this.mailQueue.add(
        'sendResetMail',
        {
          username: user.lastName,
          to: email,
          token: resetToken,
        },
        { delay: 3000, lifo: true },
      );
    }
    return { message: 'Check your email address' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { newPassword, confirmPassword } = resetPasswordDto;
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords must be equal');
    }

    const token = await this.userRepository.findOne({
      where: {
        resetPasswordToken: resetPasswordDto.resetToken,
      },
    });

    if (!token) {
      throw new UnauthorizedException('Incorrect token');
    }
    if (token.resetPasswordExpires < new Date()) {
      throw new BadRequestException(
        'Token has expired. Please request a new one.',
      );
    }

    if (token) {
      token.resetPasswordToken = null;
      token.resetPasswordExpires = null;
      await this.userRepository.save(token);

      const user = await this.userRepository.findOneBy({
        userId: token.userId,
      });

      if (user) {
        const hashedPwd = await bcrypt.hash(resetPasswordDto.newPassword, 10);
        user.password = hashedPwd;
        await this.userRepository.save(user);

        return { message: 'Password changed successfully' };
      }
    } else {
      throw new BadRequestException('Token not found or expired');
    }
  }

  async logout(userId: string) {
    const user = await this.userRepository.findOne({ where: { userId } });
    user.refreshToken = null;
    await this.userRepository.save(user);
  }
}
