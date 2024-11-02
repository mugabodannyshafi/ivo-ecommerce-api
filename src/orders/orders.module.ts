import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../typeorm/entities/Order';
import { OrderItem } from '../typeorm/entities/orderItem';
import { CartItem } from '../typeorm/entities/CartItems';
import { User } from '../typeorm/entities/User';
import { ShoppingCart } from '../typeorm/entities/Cart';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, CartItem, User, ShoppingCart]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, JwtService],
})
export class OrdersModule {}
