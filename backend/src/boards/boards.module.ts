import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './boards.entity';
import { StatusesModule } from 'src/statuses/statuses.module';
import { AuthModule } from 'src/auth/auth.module';
import { BoardGateway } from './board.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Board]), StatusesModule, AuthModule],
  controllers: [BoardsController],
  providers: [BoardsService, BoardGateway],
  exports: [BoardsService, BoardGateway],
})
export class BoardsModule {}
