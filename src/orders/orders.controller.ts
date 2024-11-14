import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UpdateOrderStatus } from './dtos/update-order-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(@Body() createOrderDto: CreateOrderDto, @Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.ordersService.checkout(createOrderDto, json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-order/:id')
  updateOrderStatus(
    @Param('id') orderId: string,
    @Req() request: Request,
    @Body() updateOrderStatus: UpdateOrderStatus,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.ordersService.updateOrderStatus(
      orderId,
      json.userId,
      updateOrderStatus,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.ordersService.findAll(json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  adminFindUserOrders(@Req() request: Request, @Param('id') userId: string) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.ordersService.adminFindUserOrders(json.userId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('forDashboard')
  findOrders(@Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.ordersService.findOrders(json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.ordersService.findOne(id, json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/:id')
  adminFindOne(@Param('id') id: string, @Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.ordersService.adminFindOne(id, json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('product-orders/:id')
  findProductOrders(@Req() request: Request, @Param('id') id: string) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };

    return this.ordersService.findProductOrders(json.userId, id);
  }
}
