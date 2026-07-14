import { User } from 'src/users/users.entity';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './tasks.entity';
import { Test } from '@nestjs/testing';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { BoardGateway } from 'src/boards/board.gateway';

describe('TasksService - priority & dueDate', () => {
  let tasksService: TasksService;
  let repo: any;

  const admin = { id: 1, role: 'ADMIN', name: 'Islam' } as User;

  beforeEach(async () => {
    const qb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ max: '0' }),
    } as any;

    const manager = {
      save: jest.fn((a, b) => Promise.resolve(b ?? a)),
      delete: jest.fn(),
    };

    const boardRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 1, project: { id: 1 } }),
    };

    repo = {
      createQueryBuilder: jest.fn().mockReturnValue(qb),
      create: jest.fn((x) => x),
      save: jest.fn((x) => Promise.resolve(x)),
      findOne: jest
        .fn()
        .mockResolvedValue({ board: { id: 1, project: { id: 1 } } }),
      manager: {
        transaction: jest.fn((cb) => cb(manager)),
        getRepository: jest.fn().mockReturnValue(boardRepo),
      },
    } as any;

    const moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: repo },
        { provide: BoardGateway, useValue: { emitToProject: jest.fn() } },
      ],
    }).compile();

    tasksService = moduleRef.get<TasksService>(TasksService);
  });

  it('should create a task with priority and dueDate', async () => {
    const createTaskDto = {
      title: 'Test Task',
      description: 'Test Description',
      priority: 'HIGH',
      dueDate: '2026-06-02',
    } as CreateTaskDto;
    const task = await tasksService.create(createTaskDto, 1, admin);
    expect(task.priority).toBe('HIGH');
    expect(task.dueDate).toBe('2026-06-02');
  });

  it('defaults priority to MEDIUM when omitted and dueDate to null', async () => {
    const createTaskDto = {
      title: 'Test Task',
      description: 'Test Description',
    } as CreateTaskDto;
    const task = await tasksService.create(createTaskDto, 1, admin);
    expect(task.priority).toBe('MEDIUM');
    expect(task.dueDate).toBeUndefined();
  });

  it('updates priority and dueDate', async () => {
    const updateTaskDto = {
      priority: 'LOW',
      dueDate: '2026-06-03',
    } as UpdateTaskDto;
    const updatedTask = await tasksService.update(1, updateTaskDto, admin);
    expect(updatedTask.priority).toBe('LOW');
    expect(updatedTask.dueDate).toBe('2026-06-03');
  });
});
