import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/typeorm/entities/User';
import { Category } from 'src/typeorm/entities/Category';
import { Product } from 'src/typeorm/entities/product';
import { Subscription } from 'src/typeorm/entities/Subscription';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, User, Category, Subscription]),
    BullModule.registerQueue({
      name: 'mailQueue',
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, JwtService],
})
export class ProductsModule {}
