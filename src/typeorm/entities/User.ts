import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './Order';
import { ShoppingCart } from './Cart';
import { Wishlist } from './Wishlist';
import { Payment } from './Payment';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'customer' })
  role: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  sex: string;

  @Column({ nullable: true })
  address: string;

  @Column({
    default:
      'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
  })
  profile: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpires: Date;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  orders: Order[];

  @OneToMany(() => Payment, (payment) => payment.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  payments: Payment[];

  @OneToOne(() => ShoppingCart, (shoppingCart) => shoppingCart.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  shoppingCart: ShoppingCart;

  @OneToOne(() => Wishlist, (wishlist) => wishlist.user, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  wishlist: Wishlist;
}
