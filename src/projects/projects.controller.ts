import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './projects.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Project> {
    return await this.projectsService.findOne(id);
  }

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    return await this.projectsService.create(createProjectDto);
  }

  @Get()
  async findAll() {
    return await this.projectsService.findAll();
  }

  @Patch(':id')
  async update(
    @Body() updateProjectDto: UpdateProjectDto,
    @Param('id') projectId: number,
  ) {
    return await this.projectsService.update(projectId, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') projectId: number) {
    return this.projectsService.remove(projectId);
  }
}
