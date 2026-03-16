import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createTaskDto: CreateTaskDto, boardId: number): Promise<Task> {
    const { assignId, statusId, ...rest } = createTaskDto;
    const task = this.taskRepo.create({
      ...rest,
      board: { id: boardId },
      assign: assignId ? { id: assignId } : undefined,
      status: statusId ? { id: statusId } : undefined,
    });
    return await this.taskRepo.save(task);
  }

  findAll(boardId: number): Promise<Task[]> {
    return this.taskRepo.find({
      where: { board: { id: boardId } },
      relations: ['status', 'assign'],
    });
  }

  findByAssignes(assignIds: number[], boardId: number): Promise<Task[]> {
    return this.taskRepo.findBy({
      board: { id: boardId },
      assign: { id: In(assignIds) },
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepo.findOneBy({ id });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async remove(id: number): Promise<void> {
    const result = await this.taskRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    const { assignId, statusId, ...rest } = updateTaskDto;
    return await this.taskRepo.save({
      ...task,
      ...rest,
      assign: assignId ? { id: assignId } : task.assign,
      status: statusId ? { id: statusId } : task.status,
    });
  }
}
