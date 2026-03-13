import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StatusesService } from './statuses.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Status } from './statuses.entity';

@Controller('statuses')
export class StatusesController {
  constructor(private readonly statusesService: StatusesService) {}

  @Post('/boards/:boardId')
  create(
    @Param('boardId') boardId: number,
    @Body() createStatusDto: CreateStatusDto,
  ): Promise<Status> {
    return this.statusesService.create(boardId, createStatusDto);
  }

  @Get('/boards/:boardId')
  findAll(@Param('boardId') boardId: number): Promise<Status[]> {
    return this.statusesService.findAll(boardId);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Status> {
    return this.statusesService.findOne(id);
  }

  @Patch('order')
  updateOrder(@Body() body: { ids: number[] }): Promise<void> {
    return this.statusesService.updateOrder(body.ids);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<Status> {
    return this.statusesService.update(id, updateStatusDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    await this.statusesService.remove(id);
  }
}
