import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Label } from './labels.entity';
import { LabelsService } from './labels.service';
import { LabelsController } from './labels.controller';
import { ProjectsService } from 'src/projects/projects.service';
import { Project } from 'src/projects/projects.entity';
import { User } from 'src/users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Label, Project, User])],
  exports: [LabelsService],
  providers: [LabelsService, ProjectsService],
  controllers: [LabelsController],
})
export class LabelsModule {}
