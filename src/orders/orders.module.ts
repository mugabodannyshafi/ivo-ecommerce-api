import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/typeorm/entities/Order';
import { OrderItem } from 'src/typeorm/entities/orderItem';
import { CartItem } from 'src/typeorm/entities/CartItems';
import { User } from 'src/typeorm/entities/User';
import { ShoppingCart } from 'src/typeorm/entities/Cart';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, CartItem, User, ShoppingCart]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, JwtService],
})
export class OrdersModule {}
