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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        if (process.env.NODE_ENV === 'prod') {
          const dbUrl = new URL(process.env.DATABASE_URL);
          const routingId = dbUrl.searchParams.get('options');
          dbUrl.searchParams.delete('options');

          return {
            type: 'cockroachdb',
            url: dbUrl.toString(),
            ssl: true,
            extra: {
              options: routingId,
            },
            entities: [
              User,
              Subscription,
              ShoppingCart,
              CartItem,
              Order,
              OrderItem,
              Wishlist,
              WishlistItem,
              Category,
              Payment,
              Product,
              Message,
            ],
            synchronize: false,
            logging: true,
          };
        } else {
          return {
            type: 'postgres',
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT, 10),
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            entities: [
              User,
              Subscription,
              ShoppingCart,
              CartItem,
              Order,
              OrderItem,
              Wishlist,
              WishlistItem,
              Category,
              Payment,
              Product,
              Message,
            ],
            synchronize: true, // Enable only for development
          };
        }
      },
    }),

    // Redis configuration for BullMQ
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),

    // Application modules
    AuthModule,
    UsersModule,
    ProductsModule,
    CollectionsModule,
    CartsModule,
    OrdersModule,
    WishlistsModule,
    SubscriptionModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
