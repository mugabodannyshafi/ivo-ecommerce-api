import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  messageId: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  contact: string;

  @Column()
  message: string;
}
