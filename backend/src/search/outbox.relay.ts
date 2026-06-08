import { InjectRepository } from '@nestjs/typeorm';
import { SearchOutbox } from './search-outbox.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Interval } from '@nestjs/schedule';
import { IndexJobData } from './search.types';

export class OutboxRelay {
  constructor(
    @InjectRepository(SearchOutbox)
    private outboxRepo: Repository<SearchOutbox>,
    @InjectQueue('search') private queue: Queue<IndexJobData>,
  ) {}

  @Interval(5000)
  async relay() {
    const rows = await this.outboxRepo.find({
      where: { processedAt: IsNull() },
      order: { id: 'ASC' },
      take: 50,
    });
    for (const row of rows) {
      await this.queue.add(
        'index',
        { outboxId: row.id, taskId: row.aggregateId, operation: row.operation },
        {
          jobId: `outbox-${row.id}`,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      );
    }
  }
}
