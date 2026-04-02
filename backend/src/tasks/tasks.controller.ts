import {
  Body,
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Query,
  Param,
  Post,
  Patch,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './tasks.entity';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { Roles } from 'src/auth/roles.decorator';
import { AddCommentDto } from './dto/add-comment.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('/boards/:boardId')
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Request() req,
  ): Promise<Task> {
    return this.tasksService.create(createTaskDto, boardId, req.user);
  }

  @Get('/boards/:boardId')
  getAll(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Request() req,
  ): Promise<Task[]> {
    return this.tasksService.findAll(boardId, req.user);
  }

  @Get('/boards/:boardId/assignees')
  async findByAssignes(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query('assignId') assignIds: string | string[],
    @Request() req,
  ): Promise<Task[]> {
    const ids = Array.isArray(assignIds)
      ? assignIds.map(Number)
      : [Number(assignIds)];

    return await this.tasksService.findByAssignes(ids, boardId, req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<Task> {
    return this.tasksService.findOne(id, req.user);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderTasksDto, @Request() req): Promise<void> {
    return this.tasksService.reorder(dto.taskIds, req.user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto, req.user);
  }

  @Post(':id/comments')
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddCommentDto,
    @Request() req,
  ): Promise<Task> {
    return this.tasksService.addComment(id, dto.text, req.user);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<void> {
    return this.tasksService.remove(id, req.user);
  }
}
