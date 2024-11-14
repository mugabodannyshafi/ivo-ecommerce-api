import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../typeorm/entities/User';
import { Category } from '../typeorm/entities/Category';
import { Product } from '../typeorm/entities/Product';
import { Subscription } from '../typeorm/entities/Subscription';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MailService } from 'src/mail/mail.service';
import { PaginationQueryDto } from 'src/dto/pagination-query.dto';
import { BaseService } from 'src/base.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @Inject(MailService) private readonly mailService: MailService,
    private readonly baseService: BaseService,
  ) {}

  async create(createProductDto: CreateProductDto, userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin')
      throw new ForbiddenException('only admin is allowed to create product');

    const category = await this.categoryRepository.findOne({
      where: { categoryId: createProductDto.categoryId },
    });

    if (!category) throw new NotFoundException('Category Not Found');
    const { categoryId, name, description, ...productDto } = createProductDto;

    if (!description) {
      throw new BadRequestException('Description is required');
    }
    if (!createProductDto.description) throw new BadRequestException();
    const product = this.productRepository.create({
      ...productDto,
      name,
      description,
      category,
    });
    const savedProduct = await this.productRepository.save(product);
    if (savedProduct) {
      const subscribers = await this.subscriptionRepository.find();
      subscribers.forEach(async (subscriber) => {
        await this.mailService.sendNewProduct(
          subscriber.email,
          savedProduct.name,
          savedProduct.description,
          savedProduct.imageURL[0],
          savedProduct.price,
          savedProduct.category.name,
          savedProduct.stockQuantity,
          savedProduct.discount,
          savedProduct.size,
        );
      });
    }
    return {
      ...savedProduct,
      category: { categoryId: category.categoryId },
    };
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { skip, take } =
      this.baseService.initializePagination(paginationQuery);

    const [products, totalCount] = await this.productRepository.findAndCount({
      take,
      skip,
      relations: ['category'],
    });

    return this.baseService.paginate(products, totalCount, paginationQuery);
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { productId: id },
      relations: ['category'],
    });
    if (!product) throw new NotFoundException('Product Not Found');
    return product;
  }

  async findPopular() {
    const products = await this.productRepository.find();
    const sortedProducts = products.sort(
      (a, b) => b.stockQuantity - a.stockQuantity,
    );

    const topProducts = sortedProducts.slice(0, 3);

    const data = topProducts.map((product) => ({
      productId: product.productId,
      product_name: product.name,
      product_image: product.imageURL[0],
      product_price: product.price,
      product_stock: product.stockQuantity,
    }));

    return data;
  }

  async findByCategory(name: string, query: number) {
    const resultPerPage = 8;
    const currentPage = Number(query) || 1;
    const skip = (currentPage - 1) * resultPerPage;
    if (name === 'all') {
      return await this.productRepository.find({
        take: resultPerPage,
        skip,
      });
    }
    const category = await this.categoryRepository.findOneBy({ name });
    if (!category) throw new NotFoundException('Category Not Found');

    const results = await this.productRepository.find({
      take: resultPerPage,
      skip,
      where: { category: { name } },
      relations: ['category'],
    });
    return results;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin')
      throw new ForbiddenException(
        'only admin is allowed to update this product',
      );

    const product = await this.productRepository.findOneBy({ productId: id });
    if (!product) throw new NotFoundException('Product Not Found');

    const result = this.productRepository.save({
      ...product,
      ...updateProductDto,
    });
    return result;
  }

  async remove(id: string, userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin')
      throw new ForbiddenException(
        'only admin is allowed to update this product',
      );

    const product = await this.productRepository.findOneBy({ productId: id });
    if (!product) throw new NotFoundException('Product Not Found');

    await this.productRepository.remove(product);

    return {
      message: 'Product deleted successfully',
    };
  }
}
