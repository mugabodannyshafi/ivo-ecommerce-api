import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';
import { Product } from 'src/typeorm/entities/product';
import { CartItem } from 'src/typeorm/entities/CartItems';
import { ShoppingCart } from 'src/typeorm/entities/Cart';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product, CartItem, ShoppingCart])],
  controllers: [CartsController],
  providers: [CartsService, JwtService],
})
export class CartsModule {}
