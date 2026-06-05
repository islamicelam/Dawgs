import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly es: ElasticsearchService) {}

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
}
