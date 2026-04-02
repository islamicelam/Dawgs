import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './boards.entity';
import { Roles } from 'src/auth/roles.decorator';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post('/projects/:projectId')
  async create(
    @Body() createBoardDto: CreateBoardDto,
    @Param('projectId') projectId: number,
    @Request() req,
  ): Promise<Board> {
    return await this.boardsService.create(projectId, createBoardDto, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Request() req): Promise<Board> {
    return await this.boardsService.findOne(id, req.user);
  }

  @Get('/projects/:id')
  async findAll(@Param('id') id: number, @Request() req): Promise<Board[]> {
    return await this.boardsService.findAll(id, req.user);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: number, @Request() req): Promise<void> {
    return await this.boardsService.remove(id, req.user);
  }

  @Patch(':id')
  async update(
    @Body() updateBoardDto: UpdateBoardDto,
    @Param('id') id: number,
    @Request() req,
  ): Promise<Board> {
    return await this.boardsService.update(id, updateBoardDto, req.user);
  }
}
