import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './projects.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from 'src/users/users.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  private isAdmin(user: User) {
    return user.role === 'ADMIN';
  }

  async findOne(id: number, user: User) {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['boards', 'boards.statuses', 'members'],
    });
    if (!project) throw new NotFoundException('Project not found');
    if (!this.isAdmin(user) && !project.members.some((member) => member.id === user.id)) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async create(createProjectDto: CreateProjectDto, user: User) {
    const project = this.projectRepo.create({
      ...createProjectDto,
      members: [{ id: user.id }],
    });
    return await this.projectRepo.save(project);
  }

  async update(id: number, updateProjectDto: UpdateProjectDto, user: User) {
    const project = await this.findOne(id, user);
    return await this.projectRepo.save({ ...project, ...updateProjectDto });
  }

  async findAll(user: User) {
    if (this.isAdmin(user)) {
      return await this.projectRepo.find({
        relations: ['boards', 'members'],
      });
    }
    return await this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.boards', 'boards')
      .leftJoinAndSelect('project.members', 'members')
      .where('members.id = :userId', { userId: user.id })
      .getMany();
  }

  async remove(id: number) {
    const result = await this.projectRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Project not found');
  }

  async share(projectId: number, userId: number, actor: User) {
    const project = await this.findOne(projectId, actor);
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    if (!project.members.some((member) => member.id === userId)) {
      project.members = [...project.members, user];
      await this.projectRepo.save(project);
    }
    return project;
  }

  async unshare(projectId: number, userId: number, actor: User) {
    const project = await this.findOne(projectId, actor);
    project.members = project.members.filter((member) => member.id !== userId);
    await this.projectRepo.save(project);
    return project;
  }
}
