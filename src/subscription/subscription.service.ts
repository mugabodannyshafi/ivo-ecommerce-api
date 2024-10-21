import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from 'src/typeorm/entities/Subscription';
import { Repository } from 'typeorm';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    const isValid = await this.subscriptionRepository.findOneBy({
      email: createSubscriptionDto.email,
    });
    if (isValid) throw new ConflictException('email already exists');
    const subscription = this.subscriptionRepository.create(
      createSubscriptionDto,
    );
    await this.subscriptionRepository.save(subscription);
    return {
      message: 'you have subscribed to our newsletter',
    };
  }

  async delete(createSubscriptionDto: CreateSubscriptionDto) {
    const subscriber = await this.subscriptionRepository.findOneBy({
      email: createSubscriptionDto.email,
    });
    if (!subscriber) throw new ConflictException('email not found');
    await this.subscriptionRepository.remove(subscriber);
    return {
      message: 'you have unsubscribed to our newsletter',
    };
  }
}
