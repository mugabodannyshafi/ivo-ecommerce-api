import { Module } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistItem } from '../typeorm/entities/WishlistItems';
import { JwtService } from '@nestjs/jwt';
import { User } from '../typeorm/entities/User';
import { Product } from '../typeorm/entities/Product';
import { Wishlist } from '../typeorm/entities/Wishlist';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist, WishlistItem, User, Product])],
  controllers: [WishlistsController],
  providers: [WishlistsService, JwtService],
})
export class WishlistsModule {}
