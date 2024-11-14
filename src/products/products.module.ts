import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../typeorm/entities/User';
import { Category } from '../typeorm/entities/Category';
import { Product } from '../typeorm/entities/Product';
import { Subscription } from '../typeorm/entities/Subscription';
import { BullModule } from '@nestjs/bull';
import { MailService } from 'src/mail/mail.service';
import { BaseService } from 'src/base.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, User, Category, Subscription]),
    BullModule.registerQueue({
      name: 'mailQueue',
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, JwtService, MailService, BaseService],
})
export class ProductsModule {}
