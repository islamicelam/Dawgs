import { Project } from 'src/projects/projects.entity';
import { CreateLabelDto } from './dto/create-label.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Label } from './labels.entity';
import { Repository } from 'typeorm';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/users/users.entity';
import { UpdateLabelDto } from './dto/update-label.dto';

@Injectable()
export class LabelsService {
  constructor(
    @InjectRepository(Label)
    private labelRepo: Repository<Label>,
  ) {}

  private isAdmin(user: User) {
    return user.role === 'ADMIN';
  }

  async findOne(id: number, user: User) {
    const label = await this.labelRepo.findOne({
      where: { id },
      relations: ['project', 'project.members'],
    });
    if (!label) throw new NotFoundException('Label not found');

    if (
      !this.isAdmin(user) &&
      !label.project.members.some((m) => m.id === user.id)
    ) {
      throw new ForbiddenException();
    }
    return label;
  }

  async findAll(project: Project) {
    return await this.labelRepo.findBy({ project });
  }

  async create(createLabelDto: CreateLabelDto, project: Project) {
    const label = this.labelRepo.create({
      ...createLabelDto,
      project: { id: project.id },
    });
    return await this.labelRepo.save(label);
  }

  async update(updateLabelDto: UpdateLabelDto, id: number, user: User) {
    const label = await this.findOne(id, user);

    Object.assign(label, updateLabelDto);
    return this.labelRepo.save(label);
  }

  async remove(id: number, user: User) {
    const label = await this.findOne(id, user);
    await this.labelRepo.remove(label);
  }
}
