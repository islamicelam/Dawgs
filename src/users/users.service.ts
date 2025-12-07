import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return { id, ...updateUserDto };
  }

  remove(id: number) {
    return this.userRepo.delete(id);
  }
}
