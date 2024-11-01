import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('wishlists')
export class WishlistsController {
  constructor(
    private readonly wishlistsService: WishlistsService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  create(
    @Body() createWishlistDto: CreateWishlistDto,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.wishlistsService.create(createWishlistDto, json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-wishlist')
  findOne(@Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.wishlistsService.findOne(json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('clear-wishlist')
  clearWishlist(@Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.wishlistsService.clearWishlists(json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.wishlistsService.remove(id, json.userId);
  }
}
