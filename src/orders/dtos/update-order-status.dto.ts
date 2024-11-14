import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class UpdateOrderStatus {
  @IsIn(['pending', 'processing', 'delivered', 'cancelled'], {
    message:
      'newStatus must be one of the following values: pending, processing, delivered, or cancelled',
  })
  newStatus: string;
}
