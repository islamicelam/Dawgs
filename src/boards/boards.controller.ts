import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './boards.entity';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post("/projects/:projectId") 
  async create (@Body() createBoardDto: CreateBoardDto, @Param('projectId') projectId: number): Promise<Board> {
    return await this.boardsService.create(projectId, createBoardDto)
  }

  @Get(':id')
  async findOne (@Param('id') id: number): Promise<Board> {
    return await this.boardsService.findOne(id)
  }

  @Get('projects/:id')
  async findAll (@Param('id') id: number): Promise<Board[]> {
    return await this.boardsService.findAll(id);
  }
  
  @Delete(':id')
  async remove (@Param('id') id: number): Promise<void> {
    return await this.boardsService.remove(id)
  }

  @Patch(':id')
  async update (@Body() updateBoardDto: UpdateBoardDto, @Param('id') id: number): Promise<Board> {
    return await this.boardsService.update(id, updateBoardDto)
  }
}
