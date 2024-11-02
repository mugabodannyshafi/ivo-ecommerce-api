import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { BullModule } from '@nestjs/bull';
import { Subscription } from './typeorm/entities/Subscription';
import { User } from './typeorm/entities/User';
import { ShoppingCart } from './typeorm/entities/Cart';
import { CartItem } from './typeorm/entities/CartItems';
import { Order } from './typeorm/entities/Order';
import { OrderItem } from './typeorm/entities/OrderItem';
import { Wishlist } from './typeorm/entities/Wishlist';
import { WishlistItem } from './typeorm/entities/WishlistItems';
import { Category } from './typeorm/entities/Category';
import { Payment } from './typeorm/entities/Payment';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CollectionsModule } from './collections/collections.module';
import { Product } from "./typeorm/entities/Product"
import { CartsModule } from './cart/carts.module';
import { OrdersModule } from './orders/orders.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { MessagesModule } from './messages/messages.module';
import { Message } from './typeorm/entities/Message';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as 'mysql' | 'postgres' | 'sqlite',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      database: process.env.DATABASE_NAME,
      password: process.env.DATABASE_PASSWORD,
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
        Message
      ],
      synchronize: true,
    }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
