import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './projects.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
  ) {}

  async findOne(id: number) {
    const project = await this.projectRepo.findOneBy({ id });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(createProjectDto: CreateProjectDto) {
    const project = this.projectRepo.create(createProjectDto);
    return await this.projectRepo.save(project);
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    return await this.projectRepo.save({ ...updateProjectDto, id });
  }
}
