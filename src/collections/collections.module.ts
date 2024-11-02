import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../typeorm/entities/Category';
import { User } from '../typeorm/entities/User';
import { JwtService } from '@nestjs/jwt';
import { Product } from '../typeorm/entities/product';

@Module({
  imports: [TypeOrmModule.forFeature([Category, User, Product])],
  controllers: [CollectionsController],
  providers: [CollectionsService, JwtService],
})
export class CollectionsModule {}
