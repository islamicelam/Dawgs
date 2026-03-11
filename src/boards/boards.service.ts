import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './boards.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { Repository } from 'typeorm';
import { UpdateBoardDto } from './dto/update-board.dto';
import { StatusesService } from 'src/statuses/statuses.service';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepo: Repository<Board>,
    private statusesService: StatusesService
  ) {}

  async create(
    projectId: number,
    createBoardDto: CreateBoardDto,
  ): Promise<Board> {
    const board = this.boardRepo.create({
      ...createBoardDto,
      project: { id: projectId },
    });
    const saved = await this.boardRepo.save(board);

    await this.statusesService.create(saved.id, {name: 'To do', category: 'TODO'})
    await this.statusesService.create(saved.id, {name: 'In Progress', category: 'IN_PROGRESS'})
    await this.statusesService.create(saved.id, {name: 'Done', category: 'DONE'})

    return saved;
  }

  findAll(projectId: number): Promise<Board[]> {
    return this.boardRepo.findBy({ project: { id: projectId } });
  }

  async findOne(id: number): Promise<Board> {
    const board = await this.boardRepo.findOneBy({ id });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async update(id: number, updateBoardDto: UpdateBoardDto) {
    const board = await this.findOne(id);
    return await this.boardRepo.save({ ...board, ...updateBoardDto });
  }

  async remove(id: number) {
    const result = await this.boardRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Board not found');
  }
}
