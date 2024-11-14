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
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { PaginationQueryDto } from 'src/dto/pagination-query.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-product')
  create(@Body() createProductDto: CreateProductDto, @Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.productsService.create(createProductDto, json.userId);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationQueryDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get('category')
  findByCategory(
    @Query('collection') category: string,
    @Query('page') page: number,
  ) {
    return this.productsService.findByCategory(category, page);
  }

  @Get('popular')
  findPopular() {
    return this.productsService.findPopular();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.productsService.update(id, updateProductDto, json.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: Request) {
    const token = request.headers.authorization.replace('Bearer ', '');
    const json = this.jwtService.decode(token, { json: true }) as {
      userId: string;
    };
    return this.productsService.remove(id, json.userId);
  }
}
