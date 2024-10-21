import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShoppingCart } from 'src/typeorm/entities/Cart';
import { CartItem } from 'src/typeorm/entities/CartItems';
import { Order } from 'src/typeorm/entities/Order';
import { OrderItem } from 'src/typeorm/entities/orderItem';
import { User } from 'src/typeorm/entities/User';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dtos/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(ShoppingCart)
    private readonly cartRepository: Repository<ShoppingCart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async checkout(createOrderDto: CreateOrderDto, userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    const cart = await this.cartRepository.findOne({
      where: { user: { userId } },
    });
    if (!cart) throw new NotFoundException('Cart Not Found');

    const cartItems = await this.cartItemRepository.find({
      where: { cart: { cartId: cart.cartId } },
      relations: ['product'],
    });
    console.log('-->cartItem', cartItems);
    if (!cartItems || cartItems.length === 0)
      throw new NotFoundException('Your cart is empty');

    const order = this.orderRepository.create({
      user,
      totalAmount: cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
      status: 'pending',
      ...createOrderDto,
    });

    const savedOrder = await this.orderRepository.save(order);

    const orderItems = cartItems.map((item) => {
      return this.orderItemRepository.create({
        order: savedOrder,
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      });
    });

    await this.orderItemRepository.save(orderItems);

    await this.cartItemRepository.remove(cartItems);

    return savedOrder;
  }

  async findAll(userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admin is allowed to view all orders');
    }

    const orders = await this.orderRepository.find({
      relations: ['orderItems', 'orderItems.product'],
    });

    return orders;
  }

  async findOne(orderId: string, userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    const order = await this.orderRepository.findOne({
      where: {
        user: { userId: user.userId },
        orderId,
      },
      relations: ['orderItems', 'orderItems.product'],
    });

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }

  async adminFindOne(orderId: string, userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin')
      throw new ForbiddenException(
        'Only only admin is allowed to perform this action',
      );

    const order = await this.orderRepository.findOne({
      where: {
        orderId,
      },
      relations: ['orderItems', 'orderItems.product'],
    });
    return order;
  }

  async updateOrderStatus(orderId: string, userId: string, newStatus: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Only admin is allowed to update order status',
      );
    }

    const validStatus = ['pending', 'delivered', 'cancelled'];

    if (!validStatus.includes(newStatus)) {
      throw new ForbiddenException('Invalid order status');
    }

    const order = await this.orderRepository.findOne({
      where: { orderId },
      relations: ['orderItems', 'orderItems.product'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = newStatus;

    const updatedOrder = await this.orderRepository.save(order);

    return updatedOrder;
  }
}
