import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../typeorm/entities/User';
import { Product } from '../typeorm/entities/product';
import { CartItem } from '../typeorm/entities/CartItems';
import { ShoppingCart } from '../typeorm/entities/Cart';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product, CartItem, ShoppingCart])],
  controllers: [CartsController],
  providers: [CartsService, JwtService],
})
export class CartsModule {}
