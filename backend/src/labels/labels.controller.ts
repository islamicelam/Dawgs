import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { LabelsService } from './labels.service';
import { ProjectsService } from 'src/projects/projects.service';
import { User } from 'src/users/users.entity';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@Controller()
export class LabelsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly labelsService: LabelsService,
  ) {}

  @Get('projects/:projectId/labels')
  async findAll(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Req() req: { user: User },
  ) {
    const project = await this.projectsService.findOne(projectId, req.user);
    return this.labelsService.findAll(project);
  }

  @Post('projects/:projectId/labels')
  async create(
    @Body() createLabelDto: CreateLabelDto,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Req() req: { user: User },
  ) {
    const project = await this.projectsService.findOne(projectId, req.user);
    return await this.labelsService.create(createLabelDto, project);
  }

  @Patch('labels/:id')
  async update(
    @Body() updateLabelDto: UpdateLabelDto,
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: User },
  ) {
    return await this.labelsService.update(updateLabelDto, id, req.user);
  }

  @Delete('labels/:id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: User },
  ) {
    return await this.labelsService.remove(id, req.user);
  }
}
