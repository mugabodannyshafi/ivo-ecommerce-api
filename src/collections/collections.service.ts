import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/typeorm/entities/Category';
import { Repository } from 'typeorm';
import { User } from 'src/typeorm/entities/User';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createCollectionDto: CreateCollectionDto, userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException('User Not Found');

    if (user.role !== 'admin')
      throw new ForbiddenException('only admin is allowed to create product');
    const collectionDuplicate = await this.categoryRepository.findOne({
      where: { name: createCollectionDto.name },
    });
    if (collectionDuplicate)
      throw new ConflictException('collection already exists');
    const collection = this.categoryRepository.create(createCollectionDto);
    return this.categoryRepository.save(collection);
  }

  findAll() {
    return this.categoryRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} collection`;
  }

  update(id: number, updateCollectionDto: UpdateCollectionDto) {
    return `This action updates a #${id} collection`;
  }

  remove(id: number) {
    return `This action removes a #${id} collection`;
  }
}
