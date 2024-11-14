import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../typeorm/entities/Message';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from '../typeorm/entities/User';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject() private readonly mailService: MailService,
  ) {}

  async create(createMessageDto: CreateMessageDto) {
    const message = this.messageRepository.create(createMessageDto);
    const admin = await this.userRepository.findOne({
      where: {
        role: 'admin',
      },
    });
    const adminEmail = admin.email;

    await this.mailService.sendMessageEmail(
      adminEmail,
      createMessageDto.name,
      createMessageDto.contact,
      createMessageDto.email,
      createMessageDto.message,
    );
    return this.messageRepository.save(message);
  }
}
