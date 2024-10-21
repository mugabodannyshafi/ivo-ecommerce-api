import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from 'src/typeorm/entities/Wishlist';
import { Repository } from 'typeorm';
import { WishlistItem } from 'src/typeorm/entities/WishlistItems';
import { User } from 'src/typeorm/entities/User';
import { Product } from 'src/typeorm/entities/product';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(WishlistItem)
    private readonly wishlistItemRepository: Repository<WishlistItem>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createWishlistDto: CreateWishlistDto, userId: string) {
    console.log('--hello');
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    const wishlist = await this.wishlistRepository.findOne({
      where: { user: { userId } },
    });
    console.log('-->wishlist', wishlist);
    if (!wishlist) throw new NotFoundException('Wishlist not found');

    const product = await this.productRepository.findOneBy({
      productId: createWishlistDto.productId,
    });
    if (!product) throw new NotFoundException('Product Not Found');

    const existedProduct = await this.wishlistItemRepository.findOne({
      where: {
        wishlist: { wishlistId: wishlist.wishlistId },
        product: { productId: product.productId },
      },
    });

    if (existedProduct) throw new ConflictException('Product Already Exists');

    const wishlistItem = this.wishlistItemRepository.create({
      wishlist: { wishlistId: wishlist.wishlistId },
      product: { productId: product.productId },
      ...createWishlistDto,
    });

    await this.wishlistItemRepository.save(wishlistItem);
    return {
      message: 'product added to your wishlist',
    };
  }

  async findOne(userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    const wishlist = await this.wishlistRepository.findOne({
      where: { user: { userId } },
    });
    if (wishlist) throw new NotFoundException('wishlist Not Found');

    const wishlistItems = await this.wishlistItemRepository.find({
      where: {
        wishlist: { wishlistId: wishlist.wishlistId },
      },
    });
    return wishlistItems;
  }

  async clearWishlists(userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    const wishlist = await this.wishlistRepository.findOne({
      where: { user: { userId } },
    });
    if (wishlist) throw new NotFoundException('wishlist Not Found');

    await this.wishlistItemRepository.delete({ wishlist });

    return { message: 'wishlist cleared successfully' };
  }

  async remove(productId: string, userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    const wishlist = await this.wishlistRepository.findOne({
      where: { user: { userId } },
    });
    if (wishlist) throw new NotFoundException('wishlist Not Found');

    const product = await this.productRepository.findOneBy({ productId });
    if (!product) throw new NotFoundException('Product Not Found');

    const wishlistItem = this.wishlistItemRepository.create({
      wishlist: { wishlistId: wishlist.wishlistId },
      product: { productId: product.productId },
    });
    if (!wishlistItem) throw new NotFoundException('Product Not Found');
    await this.wishlistItemRepository.remove(wishlistItem);

    return {
      message: 'Product deleted from wishlist',
      statusCode: 200,
    };
  }
}
