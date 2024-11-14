import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from './User';
import { WishlistItem } from './WishlistItems';

@Entity({ name: 'wishlists' })
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  wishlistId: string;

  @OneToOne(() => User, (user) => user.wishlist)
  user: User;

  @OneToMany(() => WishlistItem, (wishlistItem) => wishlistItem.wishlist)
  wishlistItems: WishlistItem[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
