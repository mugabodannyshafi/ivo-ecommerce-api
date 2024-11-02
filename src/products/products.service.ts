import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../typeorm/entities/User';
import { Category } from '../typeorm/entities/Category';
import { Product } from '../typeorm/entities/product';
import { Subscription } from '../typeorm/entities/Subscription';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

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
    @InjectQueue('mailQueue') private readonly mailQueue: Queue,
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
        await this.mailQueue.add(
          'sendNewProduct',
          {
            to: subscriber.email,
            name: savedProduct.name,
            description: savedProduct.description,
            imagePath: savedProduct.imageURL,
            price: savedProduct.price,
            category: savedProduct.category.name,
            quantity: savedProduct.stockQuantity,
            discount: savedProduct.discount,
            size: savedProduct.size,
          },
          { delay: 3000, lifo: true },
        );
      });
    }
    return {
      ...savedProduct,
      category: { categoryId: category.categoryId },
    };
  }

  async findAll(query: number) {
    const resultPerPage = 9;
    const currentPage = Number(query) || 1;
    const skip = (currentPage - 1) * resultPerPage;

    const products = await this.productRepository.find({
      take: resultPerPage,
      skip,
    });

    return products;
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({ productId: id });
    if (!product) throw new NotFoundException('Product Not Found');
    return product;
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
      where: {
        category: category,
      },
      take: resultPerPage,
      skip,
    });

    return results;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    console.log('--->updateUserDto', updateProductDto);
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
