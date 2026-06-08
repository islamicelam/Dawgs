import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchOutbox } from './search-outbox.entity';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { IndexJobData } from './search.types';

@Processor('search')
export class SearchProcessor extends WorkerHost {
  private readonly logger = new Logger(SearchProcessor.name);
  constructor(
    @InjectRepository(SearchOutbox)
    private outboxRepo: Repository<SearchOutbox>,
  ) {
    super();
  }

  async process(job: Job<IndexJobData>): Promise<void> {
    const { outboxId, taskId, operation } = job.data;
    this.logger.log(`Processing ${operation} for task ${taskId}`);
    await this.outboxRepo.update(outboxId, { processedAt: new Date() });
  }
}
