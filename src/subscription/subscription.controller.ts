import { Body, Controller, Delete, Post } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Delete()
  delete(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionService.delete(createSubscriptionDto);
  }
}
