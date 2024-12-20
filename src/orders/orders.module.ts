import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../typeorm/entities/Order';
import { OrderItem } from '../typeorm/entities/OrderItem';
import { CartItem } from '../typeorm/entities/CartItems';
import { User } from '../typeorm/entities/User';
import { ShoppingCart } from '../typeorm/entities/Cart';
import { JwtService } from '@nestjs/jwt';
import { Product } from 'src/typeorm/entities/Product';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      CartItem,
      User,
      ShoppingCart,
      Product,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, JwtService],
})
export class OrdersModule {}
