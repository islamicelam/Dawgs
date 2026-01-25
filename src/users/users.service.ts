import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as bcrypt from 'bcrypt';
import { Task } from 'src/tasks/tasks.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}

  async createUser(userDto: CreateUserDto) {
    const hash = await bcrypt.hash(userDto.password, 10);
    const user = this.userRepo.create({ ...userDto, password: hash });
    return this.userRepo.save(user);
  }

  findAll() {
    return this.userRepo.find();
  }

  findOne(id: number) {
    return this.userRepo.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    return this.userRepo.save({ ...updateUserDto, id });
  }

  async remove(id: number): Promise<void> {
    const taskCount = await this.taskRepo.count({
      where: { assignee: { id } },
    });

    if (taskCount > 0) {
      throw new BadRequestException(
        `User cannot be deleted because they have ${taskCount} assigned tasks`,
      );
    }

    const result = await this.userRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
