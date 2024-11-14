import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShoppingCart } from '../typeorm/entities/Cart';
import { CartItem } from '../typeorm/entities/CartItems';
import { Order } from '../typeorm/entities/Order';
import { OrderItem } from '../typeorm/entities/OrderItem';
import { User } from '../typeorm/entities/User';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dtos/create-order.dto';
import { Product } from '../typeorm/entities/Product';
import { UpdateOrderStatus } from './dtos/update-order-status.dto';

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
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
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
        price: Number(item.price),
        color: item.color,
        size: item.size,
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

  async adminFindUserOrders(admin: string, userId: string) {
    const adminUser = await this.userRepository.findOneBy({ userId: admin });
    if (!adminUser) throw new NotFoundException('User Not Found');

    if (adminUser.role !== 'admin') {
      throw new ForbiddenException('Only admin is allowed to view all orders');
    }

    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');
    console.log('---->user', user)

    const orders = await this.orderRepository.find({
      where: { user },
    });

    console.log('---->orders', orders);
  }

  async findOrders(userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admin is allowed to view all orders');
    }

    const orders = await this.orderRepository.find({
      relations: ['user'],
    });
    const data = orders.map((order) => ({
      id: order.orderId,
      customerFirstName: order.user.firstName,
      userId: user.userId,
      customerLastName: order.user.lastName,
      orderDate: order.orderDate,
      orderTotal: order.totalAmount,
      phoneNumber: order.phone,
      shippingAddress: order.address,
      shippingCity: order.city,
      orderStatus: order.status,
    }));

    return data;
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
      relations: ['orderItems', 'orderItems.product', 'user'],
    });
    return order;
  }

  async updateOrderStatus(
    orderId: string,
    userId: string,
    updateOrderStatus: UpdateOrderStatus,
  ) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Only admin is allowed to update order status',
      );
    }

    const validStatus = ['pending', 'processing', 'delivered', 'cancelled'];

    if (!validStatus.includes(updateOrderStatus.newStatus)) {
      throw new ForbiddenException('Invalid order status');
    }

    const order = await this.orderRepository.findOne({
      where: { orderId },
      relations: ['orderItems', 'orderItems.product'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = updateOrderStatus.newStatus;

    const updatedOrder = await this.orderRepository.save(order);

    return updatedOrder;
  }

  async findProductOrders(userId: string, productId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Only admin is allowed to view product orders',
      );
    }

    const product = await this.productsRepository.findOne({
      where: { productId },
    });
    if (!product) throw new NotFoundException('Product Not Found');

    const orders = await this.orderRepository.find({
      relations: ['orderItems', 'orderItems.product', 'user'],
    });

    const filteredOrders = orders
      .filter((order) =>
        order.orderItems.some((item) => item.product.productId === productId),
      )
      .map((order) => ({
        orderId: order.orderId,
        customerName: `${order.user.firstName} ${order.user.lastName}`,
        orderDate: order.orderDate,
        orderStatus: order.status,
        totalAmount: order.totalAmount,
        shippingAddress: order.address,
        shippingCity: order.city,
        phoneNumber: order.phone,
        items: order.orderItems
          .filter((item) => item.product.productId === productId)
          .map((item) => ({
            quantity: item.quantity,
            price: item.price,
            color: item.color,
            size: item.size,
          })),
      }));

    return filteredOrders;
  }
}
