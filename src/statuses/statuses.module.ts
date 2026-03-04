import { Module } from '@nestjs/common';
import { StatusesService } from './statuses.service';
import { StatusesController } from './statuses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Status } from './status.entity';
import { Board } from 'src/boards/boards.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Status, Board])],
  controllers: [StatusesController],
  providers: [StatusesService],
})
export class StatusesModule {}
