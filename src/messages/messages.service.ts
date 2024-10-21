import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/typeorm/entities/Message';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from 'src/typeorm/entities/User';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectQueue('mailQueue') private readonly mailQueue: Queue,
  ) {}

  async create(createMessageDto: CreateMessageDto) {
    const message = this.messageRepository.create(createMessageDto);
    const admin = await this.userRepository.findOne({
      where: {
        role: 'admin',
      },
    });
    const adminEmail = admin.email;
    await this.mailQueue.add(
      'sendEmailMessage',
      {
        to: adminEmail,
        name: createMessageDto.name,
        contact: createMessageDto.contact,
        email: createMessageDto.email,
        message: createMessageDto.message,
      },
      { delay: 3000, lifo: true },
    );
    return this.messageRepository.save(message);
  }
}
