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

  @Post()
  create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  getAll(): Promise<Task[]> {
    return this.tasksService.getAll();
  }

  @Get('by-assignee')
  findByAssignes(
    @Query('assignId') assignIds: string | string[],
  ): Promise<Task[]> {
    const ids = Array.isArray(assignIds)
      ? assignIds.map(Number)
      : [Number(assignIds)];

    return this.tasksService.findByAssignes(ids);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Task | null> {
    return this.tasksService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.tasksService.remove(+id);
  }
}
