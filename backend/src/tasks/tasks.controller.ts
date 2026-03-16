import {
  Body,
  Controller,
  Delete,
  Get,
  Query,
  Param,
  Post,
  Patch,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './tasks.entity';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('/boards/:boardId')
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Param('boardId') boardId: number,
  ): Promise<Task> {
    return this.tasksService.create(createTaskDto, boardId);
  }

  @Get('/boards/:boardId')
  getAll(@Param('boardId') boardId: number): Promise<Task[]> {
    return this.tasksService.findAll(boardId);
  }

  @Get('/boards/:boardId/assignees')
  async findByAssignes(
    @Param('boardId') boardId: number,
    @Query('assignId') assignIds: string | string[],
  ): Promise<Task[]> {
    const ids = Array.isArray(assignIds)
      ? assignIds.map(Number)
      : [Number(assignIds)];

    return await this.tasksService.findByAssignes(ids, boardId);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.tasksService.remove(id);
  }
}
