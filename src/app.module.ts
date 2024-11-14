import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CollectionsModule } from './collections/collections.module';
import { CartsModule } from './cart/carts.module';
import { OrdersModule } from './orders/orders.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { MessagesModule } from './messages/messages.module';

import { User } from './typeorm/entities/User';
import { Subscription } from './typeorm/entities/Subscription';
import { ShoppingCart } from './typeorm/entities/Cart';
import { CartItem } from './typeorm/entities/CartItems';
import { Order } from './typeorm/entities/Order';
import { OrderItem } from './typeorm/entities/OrderItem';
import { Wishlist } from './typeorm/entities/Wishlist';
import { WishlistItem } from './typeorm/entities/WishlistItems';
import { Category } from './typeorm/entities/Category';
import { Payment } from './typeorm/entities/Payment';
import { Product } from './typeorm/entities/Product';
import { Message } from './typeorm/entities/Message';

import { URL } from 'url';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),

    AuthModule,
    UsersModule,
    ProductsModule,
    CollectionsModule,
    CartsModule,
    OrdersModule,
    WishlistsModule,
    SubscriptionModule,
    MessagesModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
