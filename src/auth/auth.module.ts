import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../typeorm/entities/User';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/LocalStrategy';
import { BullModule } from '@nestjs/bull';
import { MailService } from '../mail/mail.service';
import { MailProcessor } from '../mail/mail.process';
import { ShoppingCart as Cart } from '../typeorm/entities/Cart';
import { Wishlist } from '../typeorm/entities/Wishlist';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Cart, Wishlist]),
    JwtModule.register({
      secret: 'abc.456',
      signOptions: { expiresIn: '1h' },
    }),
    BullModule.registerQueue(
      {
        name: 'mailQueue',
      },
      {
        name: 'fileUpload',
      },
    ),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    MailService,
    MailProcessor,
  ],
})
export class AuthModule {}
