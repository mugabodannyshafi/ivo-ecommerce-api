import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { CartItem } from './CartItems';
import { User } from './User';

@Entity({ name: 'carts' })
export class ShoppingCart {
  @PrimaryGeneratedColumn('uuid')
  cartId: string;

  @ManyToOne(() => User, (user) => user.shoppingCart)
  user: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  cartItems: CartItem[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
