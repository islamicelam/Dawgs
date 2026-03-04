import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StatusesService } from './statuses.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('statuses')
export class StatusesController {
  constructor(private readonly statusesService: StatusesService) {}

  @Post('/boards/:boardId')
  create(@Param('boardId') boardId: number, @Body() createStatusDto: CreateStatusDto) {
    return this.statusesService.create(boardId, createStatusDto)
  }

  @Get('/boards/:boardId')
  findAll(@Param('boardId') boardId: number) {
    return this.statusesService.findAll(boardId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.statusesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateStatusDto: UpdateStatusDto) {
    return this.statusesService.update(id, updateStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.statusesService.remove(id);
  }
}

