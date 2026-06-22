import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Label } from './labels.entity';
import { LabelsService } from './labels.service';
import { LabelsController } from './labels.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Label])],
  exports: [LabelsService],
  providers: [LabelsService],
  controllers: [LabelsController],
})
export class LabelsModule {}
