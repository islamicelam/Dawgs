import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/tasks/tasks.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly es: ElasticsearchService,
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
  ) {}

  async onModuleInit() {
    try {
      const ok = await this.es.ping();
      this.logger.log(`Elasticsearch ping: ${ok}`);
    } catch (err) {
      this.logger.error('Elasticsearch is not reachable', err as Error);
    }
    try {
      await this.ensureIndex();
    } catch (err) {
      this.logger.error('Elasticsearch init failed', err as Error);
    }
  }

  async ensureIndex() {
    const exists = await this.es.indices.exists({ index: 'tasks' });
    if (!exists) {
      await this.es.indices.create({
        index: 'tasks',
        mappings: {
          properties: {
            title: { type: 'text' },
            description: { type: 'text' },
            priority: { type: 'keyword' },
          },
        },
      });
    }
    this.logger.log('Index "tasks" created');
  }

  async indexTask(task: Task): Promise<void> {
    await this.es.index({
      index: 'tasks',
      id: String(task.id), // idempotency
      document: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        type: task.type,
        projectId: task.board?.project?.id,
        boardId: task.board?.id,
        status: task.status?.name,
      },
    });
  }

  async removeFromIndex(taskId: number): Promise<void> {
    try {
      await this.es.delete({ index: 'tasks', id: String(taskId) });
    } catch (err) {
      if ((err as { meta?: { statusCode?: number } }).meta?.statusCode !== 404)
        throw err;
    }
  }

  async reindexAll(): Promise<number> {
    const tasks = await this.taskRepo.find({
      relations: ['board', 'board.project', 'status'],
    });
    for (const task of tasks) {
      await this.indexTask(task);
    }
    return tasks.length;
  }
}
