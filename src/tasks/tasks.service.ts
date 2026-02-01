import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './tasks.entity';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepo.create(createTaskDto);
    return await this.taskRepo.save(task);
  }

  getAll(): Promise<Task[]> {
    return this.taskRepo.find();
  }

  findByAssignes(assignIds: number[]): Promise<Task[]> {
    return this.taskRepo
      .createQueryBuilder('task')
      .innerJoinAndSelect('task.assign', 'assign')
      .where('assign.id IN (:...assignIds)', { assignIds })
      .getMany();
  }

  findOne(id: number): Promise<Task | null> {
    return this.taskRepo.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    const result = await this.taskRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    return await this.taskRepo.save({ ...updateTaskDto, id });
  }
}
