import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Wishlist } from './Wishlist';
import { Product } from './product';


@Entity({ name: 'wishlistItems' })
export class WishlistItem {
  @PrimaryGeneratedColumn('uuid')
  wishlistItemId: string;

  @ManyToOne(() => Wishlist, (wishlist) => wishlist.wishlistItems, { onDelete: 'CASCADE' })
  wishlist: Wishlist;

  @ManyToOne(() => Product, (product) => product, { onDelete: "CASCADE" })
  product: Product;
}
