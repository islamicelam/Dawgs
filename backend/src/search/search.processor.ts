import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchOutbox } from './search-outbox.entity';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { IndexJobData } from './search.types';
import { Task } from 'src/tasks/tasks.entity';
import { SearchService } from './search.service';

@Processor('search')
export class SearchProcessor extends WorkerHost {
  private readonly logger = new Logger(SearchProcessor.name);
  constructor(
    @InjectRepository(SearchOutbox)
    private outboxRepo: Repository<SearchOutbox>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly search: SearchService,
  ) {
    super();
  }

  async process(job: Job<IndexJobData>): Promise<void> {
    const { outboxId, taskId, operation } = job.data;

    if (operation === 'DELETE') {
      await this.search.removeFromIndex(taskId);
    } else {
      const task = await this.taskRepo.findOne({
        where: { id: taskId },
        relations: ['board', 'board.project', 'status'],
      });
      if (task) await this.search.indexTask(task); // no task - skip (already deleted)
    }

    await this.outboxRepo.update(outboxId, { processedAt: new Date() });
  }
}
