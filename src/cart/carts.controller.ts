import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('carts')
export class CartsController {
  constructor(
    private readonly cartsService: CartsService,
    private jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  create(@Body() createCartDto: CreateCartDto, @Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.cartsService.create(createCartDto, json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-cart')
  findOne(@Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.cartsService.findOne(json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('clear-cart')
  clearCart(@Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.cartsService.clearCart(json.userId);
  } 

  @UseGuards(JwtAuthGuard)
  @Patch('update-cart')
  update(@Body() updateCartDto: UpdateCartDto[], @Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.cartsService.updateCart(updateCartDto, json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: Request) {
    console.log('--->inside here')
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.cartsService.remove(id, json.userId);
  }
}
