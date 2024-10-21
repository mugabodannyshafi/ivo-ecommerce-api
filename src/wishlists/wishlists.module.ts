import { Module } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistItem } from 'src/typeorm/entities/WishlistItems';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/typeorm/entities/User';
import { Product } from 'src/typeorm/entities/product';
import { Wishlist } from 'src/typeorm/entities/Wishlist';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist, WishlistItem, User, Product])],
  controllers: [WishlistsController],
  providers: [WishlistsService, JwtService],
})
export class WishlistsModule {}
