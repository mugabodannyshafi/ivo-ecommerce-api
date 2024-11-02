import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../typeorm/entities/User';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.userRepository.find();
    return users;
  }

  async findOne(userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ userId: id });
    if (!user) throw new NotFoundException('User Not Found');
    const result = this.userRepository.save({ ...user, ...updateUserDto });
    return result;
  }

  async remove(id: string) {
    const user = await this.userRepository.findOneBy({ userId: id });
    if (!user) throw new NotFoundException('User Not Found');
    await this.userRepository.remove(user);
    return {
      message: 'User deleted successfully',
    };
  }
}
