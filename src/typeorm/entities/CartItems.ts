import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ShoppingCart } from './Cart';
import { Product } from './Product';
@Entity({ name: 'cartItems' })
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  cartItemId: string;

  @ManyToOne(() => ShoppingCart, (shoppingCart) => shoppingCart.cartItems)
  cart: ShoppingCart;

  @Column()
  quantity: number;

  @Column()
  color: string;

  @Column()
  size: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => Product, (product) => product.cartItems)
  product: Product;
}
