import { Body, Controller, Param, Post } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post("/projects/:projectId") 
  create (@Body() CreateBoardDto: CreateBoardDto, @Param('projectId') projectId: number) {
    return this.boardsService.create(projectId, CreateBoardDto)
  }
}
