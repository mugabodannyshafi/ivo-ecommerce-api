import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ShoppingCart as Cart } from 'src/typeorm/entities/Cart';
import { Repository } from 'typeorm';
import { CartItem as CartItems } from 'src/typeorm/entities/CartItems';
import { User } from 'src/typeorm/entities/User';
import { Product } from 'src/typeorm/entities/Product';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItems)
    private readonly cartItemsRepository: Repository<CartItems>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createCartDto: CreateCartDto, userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    const cart = await this.cartRepository.findOne({
      where: { user: { userId } },
    });
    if (!cart) throw new NotFoundException('Cart Not Found');

    const product = await this.productRepository.findOneBy({
      productId: createCartDto.productId,
    });
    if (!product) throw new NotFoundException('Product Not Found');

    const existedProduct = await this.cartItemsRepository.findOne({
      where: {
        cart: { cartId: cart.cartId },
        product: { productId: product.productId },
      },
    });

    if (existedProduct) throw new ConflictException('Product Already Exists');

    const cartItem = this.cartItemsRepository.create({
      cart: { cartId: cart.cartId },
      product: { productId: product.productId },
      ...createCartDto,
    });

    const result = await this.cartItemsRepository.save(cartItem);
    return {
      message: 'product added to cart',
      cartItem: result,
    };
  }

  async findOne(userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    const cart = await this.cartRepository.findOne({
      where: { user: { userId } },
    });
    if (!cart) throw new NotFoundException('Cart Not Found');

    const cartItems = await this.cartItemsRepository.find({
      where: {
        cart: { cartId: cart.cartId },
      },
      relations: ['product'],
    });
    return cartItems;
  }

  async clearCart(userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    const cart = await this.cartRepository.findOne({
      where: { user: { userId } },
    });
    if (!cart) throw new NotFoundException('Cart Not Found');

    await this.cartItemsRepository.delete({ cart });

    return { message: 'Cart cleared successfully' };
  }

  async updateCart(updates: UpdateCartDto[], userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    const cart = await this.cartRepository.findOne({
      where: { user: { userId } },
    });
    if (!cart) throw new NotFoundException('Cart Not Found');

    // Validate each product in the updates
    const productPromises = updates.map(async (update) => {
      const { productId, quantity } = update;

      const product = await this.productRepository.findOne({
        where: { productId },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      if (
        quantity <= 0 ||
        !Number.isInteger(quantity) ||
        product.stockQuantity < quantity
      ) {
        throw new BadRequestException(
          `Only ${product.stockQuantity} units of ${product.name} are available in store`,
        );
      }

      return product;
    });

    await Promise.all(productPromises);

    // Update the cart items with new quantity, price, and color
    const updatePromises = updates.map(async (update) => {
      const { productId, quantity, price, color } = update; // Add color here

      const cartItem = await this.cartItemsRepository.findOne({
        where: {
          cart: { cartId: cart.cartId },
          product: { productId },
        },
      });

      if (!cartItem) {
        throw new NotFoundException(
          `Cart item for product ${productId} not found`,
        );
      }

      // Update the cart item's fields, including color
      cartItem.quantity = quantity;
      cartItem.price = price;
      cartItem.color = color; // Set the new color here

      return this.cartItemsRepository.save(cartItem);
    });

    await Promise.all(updatePromises);

    const updatedCartItems = await this.cartItemsRepository.find({
      where: { cart },
    });

    const total = updatedCartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return {
      message: 'Cart items updated successfully',
      cartItems: updatedCartItems,
      total,
    };
  }

  async remove(productId: string, userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    const cart = await this.cartRepository.findOne({
      where: { user: { userId } },
    });
    if (!cart) throw new NotFoundException('Cart Not Found');

    const product = await this.productRepository.findOneBy({ productId });
    if (!product) throw new NotFoundException('Product Not Found');

    const cartItem = await this.cartItemsRepository.findOne({
      where: {
        cart: { cartId: cart.cartId },
        product: { productId: product.productId },
      },
    });
    if (!cartItem) throw new NotFoundException('Product Not Found');
    await this.cartItemsRepository.remove(cartItem);

    return {
      message: 'Product deleted from the cart',
      statusCode: 200,
    };
  }
}
