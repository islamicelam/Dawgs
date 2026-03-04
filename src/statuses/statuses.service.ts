import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Status } from './status.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class StatusesService {
  constructor(
    @InjectRepository(Status)
    private statusRepository: Repository<Status>,
  ) {}

  async create(boardId: number, createStatusDto: CreateStatusDto): Promise<Status> {
    const status = this.statusRepository.create({
      ...createStatusDto, 
      board: {id: boardId}
  });
    return await this.statusRepository.save(status);
  }

  findAll(boardId: number): Promise<Status[]> {
    return this.statusRepository.findBy({ board: { id: boardId } });
  }

  async findOne(id: number): Promise<Status> {
    const status = await this.statusRepository.findOneBy({ id });
    if (!status) throw new NotFoundException(`Status ${id} not found`);
    return status;
  }

  async update(id: number, updateStatusDto: UpdateStatusDto) {
    const status = await this.findOne(id);
    return await this.statusRepository.save({ ...status, ...updateStatusDto });
  }

  remove(id: number) {
    return this.statusRepository.delete(id);
  }
}
