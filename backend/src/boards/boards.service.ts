import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './boards.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { Repository } from 'typeorm';
import { UpdateBoardDto } from './dto/update-board.dto';
import { StatusesService } from 'src/statuses/statuses.service';
import { User } from 'src/users/users.entity';
import { Project } from 'src/projects/projects.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepo: Repository<Board>,
    private statusesService: StatusesService,
  ) {}

  private isAdmin(user: User) {
    return user.role === 'ADMIN';
  }

  private async ensureProjectAccess(
    projectId: number,
    user: User,
  ): Promise<void> {
    if (this.isAdmin(user)) return;
    const projectRepo = this.boardRepo.manager.getRepository(Project);
    const project = await projectRepo.findOne({
      where: { id: projectId },
      relations: ['members'],
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.members.length === 0) {
      project.members = [{ id: user.id } as User];
      await projectRepo.save(project);
      return;
    }
    if (!project.members.some((member) => member.id === user.id)) {
      throw new NotFoundException('Project not found');
    }
  }

  private async ensureBoardAccess(boardId: number, user: User): Promise<void> {
    if (this.isAdmin(user)) return;
    const board = await this.boardRepo.findOne({
      where: { id: boardId },
      relations: ['project', 'project.members'],
    });
    if (!board) throw new NotFoundException('Board not found');
    if (board.project.members.length === 0) {
      const projectRepo = this.boardRepo.manager.getRepository(Project);
      board.project.members = [{ id: user.id } as User];
      await projectRepo.save(board.project);
      return;
    }
    if (!board.project.members.some((member) => member.id === user.id)) {
      throw new NotFoundException('Board not found');
    }
  }

  async create(
    projectId: number,
    createBoardDto: CreateBoardDto,
    user: User,
  ): Promise<Board> {
    await this.ensureProjectAccess(projectId, user);
    const board = this.boardRepo.create({
      ...createBoardDto,
      project: { id: projectId },
    });
    const saved = await this.boardRepo.save(board);

    await this.statusesService.create(saved.id, {
      name: 'To do',
      category: 'TODO',
    });
    await this.statusesService.create(saved.id, {
      name: 'In Progress',
      category: 'IN_PROGRESS',
    });
    await this.statusesService.create(saved.id, {
      name: 'Done',
      category: 'DONE',
    });

    return saved;
  }

  async findAll(projectId: number, user: User): Promise<Board[]> {
    await this.ensureProjectAccess(projectId, user);
    return this.boardRepo.findBy({ project: { id: projectId } });
  }

  async findOne(id: number, user: User): Promise<Board> {
    await this.ensureBoardAccess(id, user);
    const board = await this.boardRepo.findOneBy({ id });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async update(id: number, updateBoardDto: UpdateBoardDto, user: User) {
    const board = await this.findOne(id, user);
    return await this.boardRepo.save({ ...board, ...updateBoardDto });
  }

  async remove(id: number, user: User) {
    await this.findOne(id, user);
    const result = await this.boardRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Board not found');
  }
}
