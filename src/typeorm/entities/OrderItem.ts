import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product';
import { Order } from './Order';

@Entity({ name: 'orderItems' })
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  orderItemId: string;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @Column()
  size: string;

  @Column()
  color: string;

  @ManyToOne(() => Product, (product) => product.orderItems, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @ManyToOne(() => Order, (order) => order.orderItems)
  order: Order;
}
