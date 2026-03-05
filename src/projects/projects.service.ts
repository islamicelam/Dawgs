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
    const project = await this.projectRepo.findOne({ 
      where: { id },
      relations: ['boards', 'boards.statuses']
    })
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(createProjectDto: CreateProjectDto) {
    const project = this.projectRepo.create(createProjectDto);
    return await this.projectRepo.save(project);
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    const project = await this.findOne(id);
    return await this.projectRepo.save({ ...project, ...updateProjectDto });
  }

  async findAll() {
    return await this.projectRepo.find();
  }

  async remove (id: number) {
    const result = await this.projectRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Project not found');
  }
}
