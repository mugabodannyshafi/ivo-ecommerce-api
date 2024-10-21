import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './Order';
import { User } from './User';

@Entity({ name: "payments" })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  paymentId: string;

  @ManyToOne(() => Order, (order) => order)
  order: Order;

  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @Column()
  paymentMethod: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'paid' })
  status: string;
}
