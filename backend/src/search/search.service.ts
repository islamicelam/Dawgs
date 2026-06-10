import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/projects/projects.entity';
import { Task } from 'src/tasks/tasks.entity';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly es: ElasticsearchService,
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
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

  async search(q: string, user: User): Promise<unknown[]> {
    const filter: QueryDslQueryContainer[] = [];
    if (user.role !== 'ADMIN') {
      const projects = await this.projectRepo.find({
        where: { members: { id: user.id } },
        select: { id: true },
      });
      const projectIds = projects.map((p) => p.id);
      if (projectIds.length === 0) return [];
      filter.push({ terms: { projectId: projectIds } });
    }

    const result = await this.es.search({
      index: 'tasks',
      size: 50,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: q,
                fields: ['title^2', 'description'], // title has more priority
                fuzziness: 'AUTO',
              },
            },
          ],
          filter, // getting rid of other
        },
      },
      highlight: { fields: { title: {}, description: {} } },
    });

    return result.hits.hits.map((hit) => ({
      id: Number(hit._id),
      score: hit._score,
      ...(hit._source as object),
      highlight: hit.highlight,
    }));
  }
}
