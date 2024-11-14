import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { User } from './src/typeorm/entities/User';
import { Subscription } from './src/typeorm/entities/Subscription';
import { ShoppingCart } from './src/typeorm/entities/Cart';
import { CartItem } from './src/typeorm/entities/CartItems';
import { Order } from './src/typeorm/entities/Order';
import { OrderItem } from './src/typeorm/entities/OrderItem';
import { Wishlist } from './src/typeorm/entities/Wishlist';
import { WishlistItem } from './src/typeorm/entities/WishlistItems';
import { Category } from './src/typeorm/entities/Category';
import { Payment } from './src/typeorm/entities/Payment';
import { Product } from './src/typeorm/entities/Product';
import { Message } from './src/typeorm/entities/Message';

config();

const configService = new ConfigService();
const databaseUrl = configService.getOrThrow('DATABASE_URL');

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const dbUrl = new URL(databaseUrl);
const routingId = dbUrl.searchParams.get('options');
dbUrl.searchParams.delete('options');

export default new DataSource({
  type: 'cockroachdb',
  url: dbUrl.toString(),
  ssl: true,
  extra: routingId ? { options: routingId } : {},
  migrations: ['dist/db/migrations/*.js'],
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
  timeTravelQueries: false,
});
