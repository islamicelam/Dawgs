import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './projects.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
  ) {}

  async findOne(id: number) {
    const project = await this.projectRepo.findOneBy({ id });
    if (project) throw new NotFoundException();
    return project;
  }
}
