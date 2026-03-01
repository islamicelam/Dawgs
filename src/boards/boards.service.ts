import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './boards.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { Repository } from 'typeorm';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepo: Repository<Board>,
  ) {}

  async create(createBoardDto: CreateBoardDto) {
    const board = this.boardRepo.create(createBoardDto);
    return await this.boardRepo.save(board);
  }

  async update(id: number, updateBoardDto: UpdateBoardDto) {
    return await this.boardRepo.save({ ...updateBoardDto, id });
  }

  async findOne(id: number) {
    const board = await this.boardRepo.findOneBy({ id });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async remove(id: number) {
    const result = await this.boardRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Board not found');
  }
}
