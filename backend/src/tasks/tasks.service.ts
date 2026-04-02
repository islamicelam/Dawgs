import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Task } from './tasks.entity';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { User } from 'src/users/users.entity';
import { randomUUID } from 'crypto';
import { Board } from 'src/boards/boards.entity';
import { Project } from 'src/projects/projects.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}

  private getMentions(text?: string): string[] {
    if (!text) return [];
    return [...new Set((text.match(/@([a-zA-Z0-9._-]+)/g) ?? []).map((m) => m.slice(1)))];
  }

  private history(action: string, user: User) {
    return {
      id: randomUUID(),
      action,
      createdAt: new Date().toISOString(),
      createdById: user.id,
      createdByName: user.name,
    };
  }

  private async ensureBoardAccess(boardId: number, user: User): Promise<void> {
    if (user.role === 'ADMIN') return;
    const boardRepo = this.taskRepo.manager.getRepository(Board);
    const board = await boardRepo.findOne({
      where: { id: boardId },
      relations: ['project', 'project.members'],
    });
    if (!board) throw new NotFoundException('Board not found');
    if (board.project.members.length === 0) {
      board.project.members = [{ id: user.id } as User];
      await boardRepo.manager.getRepository(Project).save(board.project);
      return;
    }
    if (!board.project.members.some((member) => member.id === user.id)) {
      throw new NotFoundException('Board not found');
    }
  }

  async create(createTaskDto: CreateTaskDto, boardId: number, user: User): Promise<Task> {
    await this.ensureBoardAccess(boardId, user);
    const { assignId, statusId, description, linkedTaskIds, subtasks, ...rest } = createTaskDto;
    const max = await this.taskRepo
      .createQueryBuilder('task')
      .where('task.boardId = :boardId', { boardId })
      .andWhere('task.statusId = :statusId', { statusId: statusId ?? null })
      .select('COALESCE(MAX(task.order), -1)', 'max')
      .getRawOne<{ max: string }>();

    const task = this.taskRepo.create({
      ...rest,
      description,
      order: Number(max?.max ?? -1) + 1,
      board: { id: boardId },
      assign: assignId ? { id: assignId } : undefined,
      status: statusId ? { id: statusId } : undefined,
      linkedTaskIds: linkedTaskIds ?? [],
      subtasks: subtasks ?? [],
      comments: [],
      history: [this.history('Task created', user)],
      descriptionMentions: this.getMentions(description),
    });
    return await this.taskRepo.save(task);
  }

  async findAll(boardId: number, user: User): Promise<Task[]> {
    await this.ensureBoardAccess(boardId, user);
    return this.taskRepo.find({
      where: { board: { id: boardId } },
      relations: ['status', 'assign'],
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async findByAssignes(assignIds: number[], boardId: number, user: User): Promise<Task[]> {
    await this.ensureBoardAccess(boardId, user);
    return this.taskRepo.findBy({
      board: { id: boardId },
      assign: { id: In(assignIds) },
    });
  }

  async findOne(id: number, user?: User): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['status', 'assign', 'board', 'board.project'],
    });
    if (!task) throw new NotFoundException('Task not found');
    if (user && user.role !== 'ADMIN') {
      const hasAccess = task.board.project.members?.some((member) => member.id === user.id);
      if (!hasAccess) throw new NotFoundException('Task not found');
    }
    return task;
  }

  async remove(id: number, user: User): Promise<void> {
    await this.findOne(id, user);
    const result = await this.taskRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.findOne(id, user);
    const { assignId, statusId, description, linkedTaskIds, subtasks, ...rest } = updateTaskDto;
    const nextHistory = [...(task.history ?? []), this.history('Task updated', user)];
    return await this.taskRepo.save({
      ...task,
      ...rest,
      description: description ?? task.description,
      assign: assignId ? { id: assignId } : task.assign,
      status: statusId ? { id: statusId } : task.status,
      linkedTaskIds: linkedTaskIds ?? task.linkedTaskIds,
      subtasks: subtasks ?? task.subtasks,
      history: nextHistory,
      descriptionMentions: this.getMentions(description ?? task.description),
    });
  }

  async reorder(taskIds: number[], user: User): Promise<void> {
    if (taskIds.length === 0) return;
    const first = await this.findOne(taskIds[0], user);
    await this.ensureBoardAccess(first.board.id, user);
    const tasks = await this.taskRepo.findBy({ id: In(taskIds) });
    const map = new Map(tasks.map((task) => [task.id, task]));
    const toSave: Task[] = [];
    taskIds.forEach((id, idx) => {
      const task = map.get(id);
      if (!task) return;
      task.order = idx;
      task.history = [...(task.history ?? []), this.history('Task reordered', user)];
      toSave.push(task);
    });
    if (toSave.length > 0) await this.taskRepo.save(toSave);
  }

  async addComment(id: number, text: string, user: User): Promise<Task> {
    const task = await this.findOne(id, user);
    const comments = [
      ...(task.comments ?? []),
      {
        id: randomUUID(),
        text,
        createdAt: new Date().toISOString(),
        createdById: user.id,
        createdByName: user.name,
        mentions: this.getMentions(text),
      },
    ];
    task.comments = comments;
    task.history = [...(task.history ?? []), this.history('Comment added', user)];
    return this.taskRepo.save(task);
  }
}
