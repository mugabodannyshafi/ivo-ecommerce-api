import { Inject, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';
import { Subscription } from '../typeorm/entities/Subscription';
import { ShoppingCart } from '../typeorm/entities/Cart';
import { CartItem } from '../typeorm/entities/CartItems';
import { Order } from '../typeorm/entities/Order';
import { OrderItem } from '../typeorm/entities/OrderItem';
import { Wishlist } from '../typeorm/entities/Wishlist';
import { WishlistItem } from '../typeorm/entities/WishlistItems';
import { Category } from '../typeorm/entities/Category';
import { Payment } from '../typeorm/entities/Payment';
import { Product } from '../typeorm/entities/Product';
import { Message } from '../typeorm/entities/Message';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
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
            migrations: ['dist/db/migrations/*.js'],
            synchronize: false,
          };
        } else {
          return {
            type: 'postgres',
            host: configService.getOrThrow('DATABASE_HOST'),
            port: parseInt(process.env.DATABASE_PORT, 10),
            username: configService.getOrThrow('DATABASE_USER'),
            password: configService.getOrThrow('DATABASE_PASSWORD'),
            database: configService.getOrThrow('DATABASE_NAME'),
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
          };
        }
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
