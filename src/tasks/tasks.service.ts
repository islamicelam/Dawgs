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
    const task = this.taskRepo.create({ ...createTaskDto, board: {id: boardId} });
    return await this.taskRepo.save(task);
  }

  findAll(boardId: number): Promise<Task[]> {
    return this.taskRepo.findBy({board: {id: boardId}});
  }

  findByAssignes(assignIds: number[], boardId: number): Promise<Task[]> {
    return this.taskRepo.findBy({
      board: { id: boardId },
      assign: { id: In(assignIds) }
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepo.findOneBy({ id });
    if (!task) throw new NotFoundException('Task not found')
    return task
  }

  async remove(id: number): Promise<void> {
    const result = await this.taskRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    return await this.taskRepo.save({ ...task ,...updateTaskDto});
  }
}
