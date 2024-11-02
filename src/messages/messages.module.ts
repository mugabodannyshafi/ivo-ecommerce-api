import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../typeorm/entities/Message';
import { User } from '../typeorm/entities/User';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, User]),
    BullModule.registerQueue(
      {
        name: 'mailQueue',
      },
      {
        name: 'fileUpload',
      },
    ),
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
