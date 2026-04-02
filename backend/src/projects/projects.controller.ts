import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './projects.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Roles } from 'src/auth/roles.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<Project> {
    return await this.projectsService.findOne(id, req.user);
  }

  @Post()
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req,
  ): Promise<Project> {
    return await this.projectsService.create(createProjectDto, req.user);
  }

  @Get()
  async findAll(@Request() req) {
    return await this.projectsService.findAll(req.user);
  }

  @Patch(':id')
  async update(
    @Body() updateProjectDto: UpdateProjectDto,
    @Param('id') projectId: number,
    @Request() req,
  ) {
    return await this.projectsService.update(projectId, updateProjectDto, req.user);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') projectId: number) {
    return this.projectsService.remove(projectId);
  }

  @Post(':id/share')
  share(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() body: { userId: number },
    @Request() req,
  ) {
    return this.projectsService.share(projectId, body.userId, req.user);
  }

  @Delete(':id/share/:userId')
  unshare(
    @Param('id', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ) {
    return this.projectsService.unshare(projectId, userId, req.user);
  }
}
