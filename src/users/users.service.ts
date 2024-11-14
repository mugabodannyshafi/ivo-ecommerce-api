import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../typeorm/entities/User';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Not } from 'typeorm';
import { In } from 'typeorm';

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

  async usersSex() {
    const maleCount = await this.userRepository.count({
      where: { sex: 'Male' },
    });

    const femaleCount = await this.userRepository.count({
      where: { sex: 'Female' },
    });

    const otherCount = await this.userRepository.count({
      where: { sex: Not(In(['Male', 'Female'])) },
    });

    const response = {
      male: maleCount,
      female: femaleCount,
      other: otherCount,
    };

    return response;
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
