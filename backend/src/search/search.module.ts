import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';
import { SearchProcessor } from './search.processor';
import { OutboxRelay } from './outbox.relay';
import { SearchOutbox } from './search-outbox.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Task } from 'src/tasks/tasks.entity';
import { SearchController } from './search.controller';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        node: config.get<string>('ELASTICSEARCH_NODE'),
      }),
    }),
    TypeOrmModule.forFeature([SearchOutbox, Task]),
    BullModule.registerQueue({ name: 'search' }),
  ],
  providers: [SearchService, SearchProcessor, OutboxRelay],
  exports: [SearchService, ElasticsearchModule],
  controllers: [SearchController],
})
export class SearchModule {}
