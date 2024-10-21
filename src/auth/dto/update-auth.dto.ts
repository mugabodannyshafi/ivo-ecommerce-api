import { PartialType } from '@nestjs/mapped-types';
import { UserDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(UserDto) {}
