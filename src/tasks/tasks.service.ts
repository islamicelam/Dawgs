import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Task } from './tasks.entity';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';


@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}

  create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepo.create(createTaskDto);
    return this.taskRepo.save(task);
  }

  getAll(): Promise<Task[]> {
    return this.taskRepo.find();
  }

  findByAssignes(assignIds: number[]): Promise<Task[]> {
    return this.taskRepo.find({where: {assign: {id: In(assignIds)}}});
  }

  findOne(id: number): Promise<Task | null> {
    return this.taskRepo.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.taskRepo.delete(id);
  }

  update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    return this.taskRepo.save({ ...updateTaskDto, id });
  }
}